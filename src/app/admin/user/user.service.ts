import { Injectable, Inject } from '@nestjs/common';
import {
  AdminUserEntity,
  AdminIsSuperuserEnum,
  AdminIsActiveEnum,
  AdminRoleEntity,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  InjectService,
  Transaction,
  TransactionRepository,
  Repository,
  In,
} from '@jiaxinjiang/nest-orm';
import {
  AdminModifyUserDTO,
  AdminUserListDTO,
  AdminUserIdListDTO,
} from './user.dto';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  AdminUpdateUserNotAllowException,
  AdminUserNoExistentException,
  AdminUsernameRepeatException,
} from './user.exception';
import { CryptoHelperProvider } from '@shared/helper';
import { OrmService } from '@typeorm/orm.service';
import { IsDeleteEnum } from '@typeorm/base.entity';
import { AdminRoleService } from '../role/role.service';

@Injectable()
export class AdminUserService extends BaseService {
  constructor(
    @Inject(AdminRoleService)
    private roleService: AdminRoleService,
    @InjectService(AdminUserEntity)
    private userEntityService: OrmService<AdminUserEntity>,
    @InjectService(AdminRoleEntity)
    private roleEntityService: OrmService<AdminRoleEntity>,
  ) {
    super();
  }

  /**
   * 获取用户列表
   * @param param0
   */
  async list({
    pageIndex,
    pageSize,
    username,
    mobile,
    email,
  }: AdminUserListDTO) {
    const users = await this.userEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: [
        {
          isDelete: IsDeleteEnum.FALSE,
          username_contains: username,
        },
        {
          isDelete: IsDeleteEnum.FALSE,
          email_contains: email,
        },
        {
          isDelete: IsDeleteEnum.FALSE,
          mobile_contains: mobile,
        },
      ],
      order: {
        isSuperuser: 'DESC',
        id: 'DESC',
      },
    });
    await this.roleService.bindUserRoles(
      users.rows,
      this.userEntityService.repository,
    );
    return users;
  }

  /**
   * 获取用户详情
   * @param id
   */
  async detail(id: number) {
    const result = await this.userEntityService.findById(id);
    await this.roleService.bindUserRoles(
      result,
      this.userEntityService.repository,
    );
    return this.clearExtraFields(result, true);
  }

  /**
   * 启用/禁用管理员用户
   * @param id
   * @param isActive
   * @param param2
   */
  async active(
    id: number,
    isActive: AdminIsActiveEnum,
    { user }: AdminIdentity,
  ) {
    const userinfo = await this.userEntityService.findById(id);
    if (!userinfo) {
      throw new AdminUserNoExistentException();
    }
    // 如果修改的是超级管理员
    if (userinfo.isSuperuser) {
      throw new AdminUpdateUserNotAllowException();
    }
    await this.userEntityService.updateById({ isActive }, id, user.id);
    return true;
  }

  /**
   * 创建用户
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async create(
    data: AdminModifyUserDTO,
    { user }: AdminIdentity,
    @TransactionRepository(AdminUserEntity)
    userRepo?: Repository<AdminUserEntity>,
  ) {
    const adminUserService = this.getService<
      AdminUserEntity,
      OrmService<AdminUserEntity>
    >(userRepo);
    const records = await adminUserService.count({ username: data.username });
    if (records) {
      throw new AdminUsernameRepeatException();
    }
    const userinfo = await adminUserService.create(data, user.id);
    await userRepo
      .createQueryBuilder()
      .relation(AdminUserEntity, 'roles')
      .of(userinfo.id)
      .add(data.roleIds);
    return userinfo;
  }

  /**
   * 更改用户信息
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async update(
    data: AdminModifyUserDTO,
    id: number,
    { user }: AdminIdentity,
    @TransactionRepository(AdminUserEntity)
    userRepo?: Repository<AdminUserEntity>,
  ) {
    const roleIds = data.roleIds;
    const adminUserService = this.getService<
      AdminUserEntity,
      OrmService<AdminUserEntity>
    >(userRepo);
    delete data.roleIds;
    const userinfo = await adminUserService.findById(id);
    if (!userinfo) {
      throw new AdminUserNoExistentException();
    }
    // 如果修改的是超级管理员，但操作人不是超级管理员
    if (userinfo.isSuperuser && !user.isSuperuser) {
      throw new AdminUpdateUserNotAllowException();
    }
    if (userinfo.username !== data.username) {
      const records = await adminUserService.count({ username: data.username });
      if (records) {
        throw new AdminUsernameRepeatException();
      }
    }
    if (data.password && userinfo.password !== data.password) {
      data.password = CryptoHelperProvider.hash(data.password);
    }
    await adminUserService.updateById(data, id, user.id);
    const allRoles = await this.roleEntityService.find({
      select: ['id'],
    });
    await userRepo
      .createQueryBuilder()
      .relation(AdminUserEntity, 'roles')
      .of(userinfo.id)
      .addAndRemove(
        roleIds,
        allRoles.map(role => role.id),
      );
    return true;
  }

  /**
   * 删除用户
   * @param param0
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async delete(
    { ids }: AdminUserIdListDTO,
    { user }: AdminIdentity,
    @TransactionRepository(AdminRoleEntity)
    adminRoleRepostory?: Repository<AdminRoleEntity>,
    @TransactionRepository(AdminUserEntity)
    adminUserRepostory?: Repository<AdminUserEntity>,
  ) {
    const users = this.generateEntity(ids, AdminUserEntity);
    const userEntityService = this.getService<
      AdminUserEntity,
      OrmService<AdminUserEntity>
    >(adminUserRepostory);
    const roleEntityService = this.getService<
      AdminRoleEntity,
      OrmService<AdminRoleEntity>
    >(adminRoleRepostory);
    const allRoles = await roleEntityService.find({
      select: ['id'],
    });
    await userEntityService.delete(
      {
        isSuperuser: AdminIsSuperuserEnum.FALSE,
        id: In(ids),
      },
      user.id,
    );
    await adminUserRepostory
      .createQueryBuilder()
      .relation(AdminUserEntity, 'roles')
      .of(users)
      .remove(allRoles.map(role => role.id));
    return true;
  }
}
