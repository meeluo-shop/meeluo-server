import { Injectable } from '@nestjs/common';
import {
  InjectService,
  In,
  Transaction,
  TransactionRepository,
  Repository,
} from '@jiaxinjiang/nest-orm';
import {
  MerchantStaffRoleEntity,
  MerchantStaffMenuEntity,
  MerchantStaffPermEntity,
  MerchantStaffIsSystemRoleEnum,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  MerchantRoleListDTO,
  MerchantRoleIdListDTO,
  MerchantModifyRoleDTO,
  MerchantHasPermissionsEnum,
  MerchantHasMenusEnum,
} from './role.dto';
import {
  MerchantStaffsExistsException,
  MerchantCodeExistsException,
} from './role.exception';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { OrmService } from '@typeorm/orm.service';

@Injectable()
export class MerchantRoleService extends BaseService {
  constructor(
    @InjectService(MerchantStaffRoleEntity)
    private roleEntityService: OrmService<MerchantStaffRoleEntity>,
    @InjectService(MerchantStaffPermEntity)
    private merchantPermEntityService: OrmService<MerchantStaffPermEntity>,
    @InjectService(MerchantStaffMenuEntity)
    private merchantMenuEntityService: OrmService<MerchantStaffMenuEntity>,
  ) {
    super();
  }

  /**
   * 校验是否是商户的角色id
   * @param roleIds
   * @param merchantId
   */
  async checkRoles(roleIds: number[], merchantId: number) {
    const roles = await this.roleEntityService.find({
      select: ['id'],
      where: {
        merchantId,
        id_in: roleIds,
      },
    });
    return roles.map(role => role.id);
  }

  /**
   * 获取角色列表
   * @param param0
   */
  async list(
    { pageIndex, pageSize, name, code }: MerchantRoleListDTO,
    { merchantId }: MerchantIdentity,
  ) {
    return this.roleEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        merchantId,
        systemRole: MerchantStaffIsSystemRoleEnum.FALSE,
        name_contains: name,
        code_contains: code,
      },
      order: {
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
      hasPermissions?: MerchantHasPermissionsEnum;
      hasMenus?: MerchantHasMenusEnum;
    } = {},
    { merchantId }: MerchantIdentity,
  ) {
    const role = await this.roleEntityService.findOne({
      where: { id, merchantId },
    });
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
  async delete(
    { ids }: MerchantRoleIdListDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    ids = await this.checkRoles(ids, merchantId);
    const ret = this.roleEntityService.repository
      .createQueryBuilder()
      .relation(MerchantStaffRoleEntity, 'staffs')
      .of(ids)
      .loadOne();
    if (ret) {
      throw new MerchantStaffsExistsException();
    }
    await this.roleEntityService.delete(
      {
        id: In(ids),
        systemRole: MerchantStaffIsSystemRoleEnum.FALSE,
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
  async create(
    data: MerchantModifyRoleDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    // 检查编号是否存在
    const count = await this.roleEntityService.count({
      merchantId,
      code: data.code,
    });
    if (count) {
      throw new MerchantCodeExistsException();
    }
    return this.roleEntityService.create(
      {
        ...data,
        merchantId,
      },
      user.id,
    );
  }

  /**
   * 获取超管的导航和权限
   */
  async getSuperuserPowers(merchantId: number) {
    const [permissions, menus] = await Promise.all([
      this.merchantPermEntityService.find(),
      this.merchantMenuEntityService.find({
        where: {
          merchantId,
        },
      }),
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
  async update(
    id: number,
    data: MerchantModifyRoleDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    const merchantRole = await this.roleEntityService.findOne({
      select: ['id'],
      where: {
        merchantId,
        code: data.code,
        systemRole: MerchantStaffIsSystemRoleEnum.FALSE,
      },
    });
    // 检查编号是否存在
    if (merchantRole && merchantRole.id !== id) {
      throw new MerchantCodeExistsException();
    }
    await this.roleEntityService.updateById(data, id, user.id);
    return true;
  }

  /**
   * 获取角色下的导航列表
   * @param roles
   */
  async getRoleMenus(roles: MerchantStaffRoleEntity[]) {
    const menus = await this.roleEntityService.repository
      .createQueryBuilder()
      .relation(MerchantStaffRoleEntity, 'menus')
      .of(roles)
      .loadMany();
    // 合并导航，并去重
    const menuList: { [id: string]: MerchantStaffMenuEntity } = {};
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
  async getRolePerms(roles: MerchantStaffRoleEntity[]) {
    const perms = await this.roleEntityService.repository
      .createQueryBuilder()
      .relation(MerchantStaffRoleEntity, 'permissions')
      .of(roles)
      .loadMany();
    // 合并权限，并去重
    const permList: { [id: string]: MerchantStaffPermEntity } = {};
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
  async getRoleMenusAndPerms(roles: MerchantStaffRoleEntity[]) {
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
   * @param merchantRoleRepostory
   * @param merchantMenuRepostory
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async bindMenus(
    { roleId, menuIds }: { roleId: number; menuIds: number[] },
    { merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantStaffRoleEntity)
    merchantRoleRepostory?: Repository<MerchantStaffRoleEntity>,
    @TransactionRepository(MerchantStaffMenuEntity)
    merchantMenuRepostory?: Repository<MerchantStaffMenuEntity>,
  ) {
    const roleIds = await this.checkRoles([roleId], merchantId);
    if (!roleIds.length) {
      return false;
    }
    const roleEntityService = this.getService<
      MerchantStaffRoleEntity,
      OrmService<MerchantStaffRoleEntity>
    >(merchantRoleRepostory);
    const menuEntityService = this.getService<
      MerchantStaffMenuEntity,
      OrmService<MerchantStaffMenuEntity>
    >(merchantMenuRepostory);
    const allMenus = await menuEntityService.find({
      where: {
        merchantId,
      },
      select: ['id'],
    });
    // 剔除不存在导航
    const filterMenuIds = menuIds.filter(id =>
      allMenus.find(menu => menu.id === id),
    );
    // 先清空角色下所有导航
    await roleEntityService.repository
      .createQueryBuilder()
      .relation(MerchantStaffRoleEntity, 'menus')
      .of(roleId)
      .remove(allMenus.map(perm => perm.id));
    await roleEntityService.repository
      .createQueryBuilder()
      .relation(MerchantStaffRoleEntity, 'menus')
      .of(roleId)
      .add(filterMenuIds);
    return true;
  }

  /**
   * 设置角色权限
   * @param param0
   * @param merchantRoleRepostory
   * @param merchantPermRepostory
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async bindPermissions(
    { roleId, permIds }: { roleId: number; permIds: number[] },
    { merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantStaffRoleEntity)
    merchantRoleRepostory?: Repository<MerchantStaffRoleEntity>,
    @TransactionRepository(MerchantStaffPermEntity)
    merchantPermRepostory?: Repository<MerchantStaffPermEntity>,
  ) {
    const roleIds = await this.checkRoles([roleId], merchantId);
    if (!roleIds.length) {
      return false;
    }
    const roleEntityService = this.getService<
      MerchantStaffRoleEntity,
      OrmService<MerchantStaffRoleEntity>
    >(merchantRoleRepostory);
    const permEntityService = this.getService<
      MerchantStaffPermEntity,
      OrmService<MerchantStaffPermEntity>
    >(merchantPermRepostory);
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
      .relation(MerchantStaffRoleEntity, 'permissions')
      .of(roleId)
      .remove(allPerms.map(perm => perm.id));
    await roleEntityService.repository
      .createQueryBuilder()
      .relation(MerchantStaffRoleEntity, 'permissions')
      .of(roleId)
      .add(filterPermIds);
    return true;
  }
}
