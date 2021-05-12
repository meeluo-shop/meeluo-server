import { Injectable } from '@nestjs/common';
import {
  InjectService,
  In,
  Transaction,
  TransactionRepository,
  Repository,
} from '@jiaxinjiang/nest-orm';
import {
  AdminRoleEntity,
  AdminMenuEntity,
  AdminPermEntity,
  AdminIsSystemRoleEnum,
  AdminUserEntity,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  AdminRoleListDTO,
  AdminRoleIdListDTO,
  AdminModifyRoleDTO,
  AdminHasPermissionsEnum,
  AdminHasMenusEnum,
} from './role.dto';
import {
  AdminUsersExistsException,
  AdminCodeExistsException,
} from './role.exception';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { OrmService } from '@typeorm/orm.service';
import { IsDeleteEnum } from '@typeorm/base.entity';

@Injectable()
export class AdminRoleService extends BaseService {
  constructor(
    @InjectService(AdminRoleEntity)
    private roleEntityService: OrmService<AdminRoleEntity>,
    @InjectService(AdminPermEntity)
    private adminPermEntityService: OrmService<AdminPermEntity>,
    @InjectService(AdminMenuEntity)
    private adminMenuEntityService: OrmService<AdminMenuEntity>,
  ) {
    super();
  }

  /**
   * 获取角色列表
   * @param param0
   */
  async list({ pageIndex, pageSize, name, code }: AdminRoleListDTO) {
    const orQuery = {
      isDelete: IsDeleteEnum.FALSE,
      // systemRole: AdminIsSystemRoleEnum.FALSE,
    };
    return this.roleEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: [
        {
          ...orQuery,
          name_contains: name,
        },
        {
          ...orQuery,
          code_contains: code,
        },
      ],
      order: {
        systemRole: 'DESC',
        id: 'DESC',
      },
    });
  }

  /**
   * 获取角色详情
   * @param id
   */
  async detail(
    id: number,
    {
      hasMenus,
      hasPermissions,
    }: {
      hasPermissions?: AdminHasPermissionsEnum;
      hasMenus?: AdminHasMenusEnum;
    } = {},
  ) {
    const role = await this.roleEntityService.findById(id);
    if (hasMenus) {
      const { menus } = await this.getRoleMenus([role]);
      role.menus = menus;
    }
    if (hasPermissions) {
      const { permissions } = await this.getRolePerms([role]);
      role.permissions = permissions;
    }
    return role;
  }

  /**
   * 删除角色
   * @param param0
   */
  async delete({ ids }: AdminRoleIdListDTO, { user }: AdminIdentity) {
    const ret = this.roleEntityService.repository
      .createQueryBuilder()
      .relation(AdminRoleEntity, 'users')
      .of(ids)
      .loadOne();
    if (ret) {
      throw new AdminUsersExistsException();
    }
    await this.roleEntityService.delete(
      {
        systemRole: AdminIsSystemRoleEnum.FALSE,
        id: In(ids),
      },
      user.id,
    );
    return true;
  }

  /**
   * 创建角色
   * @param data
   * @param param1
   */
  async create(data: AdminModifyRoleDTO, { user }: AdminIdentity) {
    // 检查编号是否存在
    const count = await this.roleEntityService.count({ code: data.code });
    if (count) {
      throw new AdminCodeExistsException();
    }
    return this.roleEntityService.create(data, user.id);
  }

  /**
   * 获取超管的导航和权限
   */
  async getSuperuserPowers() {
    const [permissions, menus] = await Promise.all([
      this.adminPermEntityService.find(),
      this.adminMenuEntityService.find(),
    ]);
    return this.clearExtraFields({
      permissions,
      menus,
    });
  }

  /**
   * 修改角色
   * @param id
   * @param data
   * @param param2
   */
  async update(id: number, data: AdminModifyRoleDTO, { user }: AdminIdentity) {
    const adminRole = await this.roleEntityService.findOne({
      select: ['id'],
      where: {
        code: data.code,
        systemRole: AdminIsSystemRoleEnum.FALSE,
      },
    });
    // 检查编号是否存在
    if (adminRole && adminRole.id !== id) {
      throw new AdminCodeExistsException();
    }
    await this.roleEntityService.updateById(data, id, user.id);
    return true;
  }

  /**
   * 获取角色下的导航列表
   * @param roles
   */
  async getRoleMenus(roles: AdminRoleEntity[]) {
    const menus = await this.roleEntityService.repository
      .createQueryBuilder()
      .relation(AdminRoleEntity, 'menus')
      .of(roles)
      .loadMany();
    // 合并导航，并去重
    const menuList: { [id: string]: AdminMenuEntity } = {};
    menus.forEach(menu => {
      if (!menuList[menu.id]) {
        menuList[menu.id] = menu;
      }
    });
    return { menus: Object.values(menuList) };
  }

  /**
   * 获取角色下的权限列表
   * @param roles
   */
  async getRolePerms(roles: AdminRoleEntity[]) {
    const perms = await this.roleEntityService.repository
      .createQueryBuilder()
      .relation(AdminRoleEntity, 'permissions')
      .of(roles)
      .loadMany();
    // 合并权限，并去重
    const permList: { [id: string]: AdminPermEntity } = {};
    perms.forEach(perm => {
      if (!permList[perm.id]) {
        permList[perm.id] = perm;
      }
    });
    return { permissions: Object.values(permList) };
  }

  /**
   * 获取角色下的权限和导航列表
   * @param roles
   */
  async getRoleMenusAndPerms(roles: AdminRoleEntity[]) {
    const [perms, menus] = await Promise.all([
      this.getRolePerms(roles),
      this.getRoleMenus(roles),
    ]);
    return {
      menus: menus.menus,
      permissions: perms.permissions,
    };
  }

  /**
   * 设置角色导航
   * @param param0
   * @param adminRoleRepostory
   * @param adminMenuRepostory
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async bindMenus(
    { roleId, menuIds }: { roleId: number; menuIds: number[] },
    @TransactionRepository(AdminRoleEntity)
    adminRoleRepostory?: Repository<AdminRoleEntity>,
    @TransactionRepository(AdminMenuEntity)
    adminMenuRepostory?: Repository<AdminMenuEntity>,
  ) {
    const roleEntityService = this.getService<
      AdminRoleEntity,
      OrmService<AdminRoleEntity>
    >(adminRoleRepostory);
    const menuEntityService = this.getService<
      AdminMenuEntity,
      OrmService<AdminMenuEntity>
    >(adminMenuRepostory);
    const allMenus = await menuEntityService.find({
      select: ['id'],
    });
    // 剔除不存在导航
    const filterMenuIds = menuIds.filter(id =>
      allMenus.find(menu => menu.id === id),
    );
    // 先清空角色下所有导航
    await roleEntityService.repository
      .createQueryBuilder()
      .relation(AdminRoleEntity, 'menus')
      .of(roleId)
      .remove(allMenus.map(perm => perm.id));
    await roleEntityService.repository
      .createQueryBuilder()
      .relation(AdminRoleEntity, 'menus')
      .of(roleId)
      .add(filterMenuIds);
    return true;
  }

  /**
   * 设置角色权限
   * @param param0
   * @param adminRoleRepostory
   * @param adminPermRepostory
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async bindPermissions(
    { roleId, permIds }: { roleId: number; permIds: number[] },
    @TransactionRepository(AdminRoleEntity)
    adminRoleRepostory?: Repository<AdminRoleEntity>,
    @TransactionRepository(AdminPermEntity)
    adminPermRepostory?: Repository<AdminPermEntity>,
  ) {
    const roleEntityService = this.getService<
      AdminRoleEntity,
      OrmService<AdminRoleEntity>
    >(adminRoleRepostory);
    const permEntityService = this.getService<
      AdminPermEntity,
      OrmService<AdminPermEntity>
    >(adminPermRepostory);
    const allPerms = await permEntityService.find({
      select: ['id'],
    });
    // 剔除不存在权限
    const filterPermIds = permIds.filter(id =>
      allPerms.find(perm => perm.id === id),
    );
    // 先清空角色下所有权限
    await roleEntityService.repository
      .createQueryBuilder()
      .relation(AdminRoleEntity, 'permissions')
      .of(roleId)
      .remove(allPerms.map(perm => perm.id));
    await roleEntityService.repository
      .createQueryBuilder()
      .relation(AdminRoleEntity, 'permissions')
      .of(roleId)
      .add(filterPermIds);
    return true;
  }

  /**
   * 绑定用户角色列表信息
   * @param entitys
   */
  async bindUserRoles(
    entitys: AdminUserEntity,
    repository: Repository<AdminUserEntity>,
  ): Promise<AdminUserEntity>;
  async bindUserRoles(
    entitys: AdminUserEntity[],
    repository: Repository<AdminUserEntity>,
  ): Promise<AdminUserEntity[]>;
  async bindUserRoles(
    entitys: AdminUserEntity | AdminUserEntity[],
    repository: Repository<AdminUserEntity>,
  ): Promise<AdminUserEntity | AdminUserEntity[]> {
    const propertyName: keyof AdminUserEntity = 'roles';
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const entityClass = repository.metadata.target;
    const resultList = await Promise.all(
      targets.map(target =>
        repository
          .createQueryBuilder()
          .relation(entityClass, propertyName)
          .of(target.id)
          .loadMany<AdminRoleEntity>(),
      ),
    );
    targets.forEach((target: any, index) => {
      target[propertyName] = resultList[index];
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }
}
