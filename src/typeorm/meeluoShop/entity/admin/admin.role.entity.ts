import {
  Column,
  Scope,
  Entity,
  JoinTable,
  ManyToMany,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { BaseEntity } from '@typeorm/base.entity';
import { AdminUserEntity } from './admin.user.entity';
import { AdminMenuEntity } from './admin.menu.entity';
import { AdminPermEntity } from './admin.permission.entity';

export enum AdminIsSystemRoleEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<AdminRoleEntity>([
  {
    column: 'is_delete',
    value: 0,
  },
])
@Entity('admin_role', { database: MEELUO_SHOP_DATABASE })
export class AdminRoleEntity extends BaseEntity {
  static AdminRoleMenuTable = 'admin_role_menu_mapping';
  static AdminRolePermTable = 'admin_role_permission_mapping';

  @Column('varchar', { length: 50, comment: '角色名称' })
  name: string;

  @Column('varchar', { length: 50, comment: '角色编号' })
  code: string;

  @Column('varchar', { length: 255, comment: '备注', nullable: true })
  remark: string;

  @Column('tinyint', {
    comment: '是否是系统内置，系统内置的角色无法修改和删除',
    unsigned: true,
    default: AdminIsSystemRoleEnum.FALSE,
  })
  systemRole: AdminIsSystemRoleEnum;

  @ManyToMany(
    () => AdminUserEntity,
    user => user.roles,
  )
  users?: AdminUserEntity[] | undefined;

  @ManyToMany(() => AdminMenuEntity)
  @JoinTable({ name: AdminRoleEntity.AdminRoleMenuTable })
  menus?: AdminMenuEntity[] | undefined;

  @ManyToMany(() => AdminPermEntity)
  @JoinTable({ name: AdminRoleEntity.AdminRolePermTable })
  permissions?: AdminPermEntity[] | undefined;
}
