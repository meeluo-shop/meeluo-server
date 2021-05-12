import * as _ from 'lodash';
import { Injectable, Inject } from '@nestjs/common';
import {
  InjectService,
  Transaction,
  TransactionRepository,
  Repository,
} from '@jiaxinjiang/nest-orm';
import { CacheProvider } from '@jiaxinjiang/nest-redis';
import { CryptoHelperProvider } from '@shared/helper';
import {
  AdminUserEntity,
  AdminIsActiveEnum,
  AdminIsSuperuserEnum,
  AdminRoleEntity,
  AdminIsSystemRoleEnum,
  AdminPermEntity,
  AdminMenuEntity,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import { JwtService } from '@jiaxinjiang/nest-jwt';
import {
  ADMIN_JWT_LOGIN_DATA_PREFIX,
  MEELUO_SHOP_DATABASE,
} from '@core/constant';
import { AdminRoleService } from '@app/admin/role/role.service';
import { AdminLoginDTO, IsEncryptEnum } from './passport.dto';
import {
  AdminAuthFailedException,
  AdminAuthExpiredException,
  AdminInvalidUserException,
  AdminUserDisabledException,
  AdminRoleHasNoPermException,
  AdminIllegalRequestException,
  AdminLandingElsewhereException,
} from './passport.exception';
import { JwtPayload } from './passport.interface';
import { AdminUserService } from '../user/user.service';
import { OrmService } from '@typeorm/orm.service';

@Injectable()
export class AdminPassportService extends BaseService {
  constructor(
    @Inject(JwtService)
    private jwtService: JwtService,
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @Inject(AdminUserService)
    private userService: AdminUserService,
    @Inject(AdminRoleService)
    private roleService: AdminRoleService,
    @InjectService(AdminUserEntity)
    private adminUserEntityService: OrmService<AdminUserEntity>,
  ) {
    super();
  }

  // 登陆会话时长，单位秒
  public loginSessionTime = 3600 * 72;

  /**
   * 生成系统管理员
   * @param username
   * @param password
   * @param realname
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async generateSystemAdmin(
    {
      username,
      password,
      realname,
    }: {
      username: string;
      password: string;
      realname: string;
    },
    @TransactionRepository(AdminUserEntity)
    adminUserRepostory?: Repository<AdminUserEntity>,
    @TransactionRepository(AdminRoleEntity)
    adminRoleRepostory?: Repository<AdminRoleEntity>,
  ) {
    const adminRoleService = this.getService<
      AdminRoleEntity,
      OrmService<AdminRoleEntity>
    >(adminRoleRepostory);
    const adminUserService = this.getService<
      AdminUserEntity,
      OrmService<AdminUserEntity>
    >(adminUserRepostory);
    const count = await adminRoleService.count({
      systemRole: AdminIsSystemRoleEnum.TRUE,
    });
    if (count) {
      throw new Error('系统管理员已存在，请勿重复创建');
    }
    const user = await adminUserService.create(
      {
        username,
        realname,
        isSuperuser: AdminIsSuperuserEnum.TRUE,
        password,
      },
      0,
    );
    const role = await adminRoleService.create(
      {
        name: '系统管理员',
        remark: '系统内置角色，无法修改和删除',
        code: 'SystemAdmin',
        systemRole: AdminIsSystemRoleEnum.TRUE,
      },
      0,
    );
    await adminUserService.repository
      .createQueryBuilder()
      .relation(AdminUserEntity, 'roles')
      .of(user)
      .add(role);
    return true;
  }

  /**
   * 获取用户的权限和菜单
   * @param user
   */
  async getPowersByUser(user: AdminUserEntity) {
    let powers: { permissions: AdminPermEntity[]; menus: AdminMenuEntity[] };
    const roles = this.generateEntity(
      (user.roles || []).map(role => role.id),
      AdminRoleEntity,
    );
    // 获取当前用户所有导航和权限
    if (user.isSuperuser) {
      powers = await this.roleService.getSuperuserPowers();
    } else {
      powers = await this.roleService.getRoleMenusAndPerms(roles);
    }
    return powers;
  }

  /**
   * 更新登陆用户信息
   * @param userId
   * @param token
   */
  async refreshToken({ user, token }: AdminIdentity): Promise<AdminIdentity> {
    const userinfo = await this.userService.detail(user.id);
    const powers = await this.getPowersByUser(userinfo);
    const loginData: AdminIdentity = await this.clearExtraFields({
      userId: user.id,
      token,
      user: userinfo,
      permissions: powers.permissions,
      menus: powers.menus,
    });
    await this.saveUserLoginCache(loginData);
    return loginData;
  }

  /**
   * 管理员用户登陆
   * @param data
   */
  async login({ username, password, encrypt }: AdminLoginDTO) {
    if (encrypt === IsEncryptEnum.TRUE) {
      password = CryptoHelperProvider.decrypt(password);
    }
    const user = await this.adminUserEntityService.findOne({
      where: {
        username,
      },
    });
    // 检查账号密码是否正确
    if (!user || !CryptoHelperProvider.compare(password, user.password)) {
      throw new AdminInvalidUserException();
    }
    // 检查账号是否可用
    if (user.isActive !== AdminIsActiveEnum.TRUE) {
      throw new AdminUserDisabledException();
    }
    // 生成jwt签名
    const token: string = this.jwtService.sign({
      userId: user.id,
    } as JwtPayload);
    // 获取用户角色信息
    await this.roleService.bindUserRoles(
      user,
      this.adminUserEntityService.repository,
    );
    const powers = await this.getPowersByUser(user);
    const currentTime: Date = new Date();
    const updateInfo: any = {};
    if (!user.firstLoginTime) {
      // 设置第一次登陆时间
      user.firstLoginTime = updateInfo.firstLoginTime = currentTime;
    }
    // 设置最后一次登陆时间
    user.lastLoginTime = updateInfo.lastLoginTime = currentTime;
    // 删除密码字段
    delete user.password;
    const loginData: AdminIdentity = this.clearExtraFields({
      userId: user.id,
      token,
      user,
      permissions: powers.permissions,
      menus: powers.menus,
    });
    // 缓存用户登陆信息，缓存2小时
    await this.saveUserLoginCache(loginData);
    // 更新用户首次登陆和最后一次登陆时间
    await this.adminUserEntityService.updateById(updateInfo, user.id, user.id);
    return loginData;
  }

  /**
   * 管理员退出登录
   * @param userId
   */
  async logout(userId: number) {
    const redisKey = ADMIN_JWT_LOGIN_DATA_PREFIX + userId;
    await this.cacheProvider.del(redisKey);
    return true;
  }

  /**
   * 保存用户登陆信息到redis
   * @param param0
   * @param expireIn
   */
  async saveUserLoginCache({ token, user, permissions }: AdminIdentity) {
    const redisKey = ADMIN_JWT_LOGIN_DATA_PREFIX + user.id;
    await this.cacheProvider.setHash(redisKey, {
      token,
      user: JSON.stringify(user),
      permissions: JSON.stringify(permissions),
      expireTime: new Date().getTime() + this.loginSessionTime,
    });
    await this.cacheProvider.expire(redisKey, this.loginSessionTime);
  }

  /**
   * 从redis里获取用户登陆信息
   * @param userId
   */
  async getUserLoginCache(userId: number) {
    const redisKey = ADMIN_JWT_LOGIN_DATA_PREFIX + userId;
    const [
      token,
      user = 'null',
      permissions = 'null',
      expireTime,
    ] = await this.cacheProvider.getHash(redisKey, [
      'token',
      'user',
      'permissions',
      'expireTime',
    ]);
    return {
      userId,
      token,
      expireTime,
      user: JSON.parse(user),
      permissions: JSON.parse(permissions),
    };
  }

  /**
   * jwt校验
   * @param token
   */
  async validateJwt(token: string) {
    // 效验token格式
    if (!token || !/JWT [\dA-Za-z=]+/.test(token)) {
      throw new AdminIllegalRequestException({
        error: 'JWT格式不正确',
      });
    }
    token = token.replace('JWT ', '');
    try {
      // token验证，失败会抛出错误
      this.jwtService.verify(token);
      // jwt数据解码，并读取redis缓存的登陆信息
      const { userId } = this.jwtService.decode(token) as JwtPayload;
      const loginData = await this.getUserLoginCache(userId);
      const { token: redisToken } = loginData;
      // 如果redis中不存在登陆信息，提示登陆过期
      if (!redisToken) {
        throw new AdminAuthExpiredException();
      }
      // 判断redis存储的token跟用户传来的token是否一致，
      if (redisToken !== token) {
        throw new AdminLandingElsewhereException();
      }
      // 自动续签
      await this.saveUserLoginCache(loginData);
      return loginData;
    } catch (e) {
      if (e.code) {
        throw e;
      }
      throw new AdminAuthFailedException({
        error: e.message,
      });
    }
  }

  /**
   * 校验路由绑定的角色身份
   * @param roles
   * @param identity
   */
  validateRole(
    roles: Array<Array<string | null> | string>,
    { user }: AdminIdentity,
  ) {
    // 超管为所欲为
    if (user.isSuperuser === AdminIsSuperuserEnum.TRUE) {
      return true;
    }
    const orRoles: string[] = [];
    const andRoles = roles.filter(role => {
      if (typeof role === 'string') {
        orRoles.push(role);
      }
      return Array.isArray(role);
    });
    const userRoles = user.roles.map(role => role.code);
    // 判断交集数量是否大于0
    if (_.intersection(userRoles, orRoles).length) {
      return true;
    }
    // 判断是否包含
    for (const andRole of andRoles) {
      if (_.intersection(userRoles, andRole).length === andRole.length) {
        return true;
      }
    }
    throw new AdminRoleHasNoPermException({
      error: '当前用户无该接口指定的角色',
    });
  }

  /**
   * 校验路由绑定的权限
   * @param perms
   * @param identity
   */
  validatePerm(
    perms: Array<Array<string | null> | string>,
    { user, permissions = [] }: AdminIdentity,
  ) {
    // 超管为所欲为
    if (user.isSuperuser === AdminIsSuperuserEnum.TRUE) {
      return true;
    }
    const orPerms: string[] = [];
    const andPerms = perms.filter(perm => {
      if (typeof perm === 'string') {
        orPerms.push(perm);
      }
      return Array.isArray(perm);
    });
    const userPerms = permissions.map(perm => perm.code);
    // 判断交集数量是否大于0
    if (_.intersection(userPerms, orPerms).length) {
      return true;
    }
    // 判断是否包含
    for (const andPerm of andPerms) {
      if (_.intersection(userPerms, andPerm).length === andPerm.length) {
        return true;
      }
    }
    throw new AdminRoleHasNoPermException({
      error: '当前用户无该接口指定的数据权限',
    });
  }
}
