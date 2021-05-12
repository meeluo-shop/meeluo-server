import {
  Column,
  Scope,
  Entity,
  JoinTable,
  ManyToMany,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantStaffEntity } from './merchant.staff.entity';
import { MerchantStaffMenuEntity } from './merchant.staff.menu.entity';
import { MerchantStaffPermEntity } from './merchant.staff.permission.entity';
import { MerchantBaseEntity } from './merchant.base.entity';

export enum MerchantStaffIsSystemRoleEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<MerchantStaffRoleEntity>([
  {
    column: 'is_delete',
    value: 0,
  },
])
@Entity('merchant_staff_role', { database: MEELUO_SHOP_DATABASE })
export class MerchantStaffRoleEntity extends MerchantBaseEntity {
  static MerchantStaffRoleMenuTable = 'merchant_staff_role_menu_mapping';
  static MerchantStaffRolePermTable = 'merchant_staff_role_permission_mapping';

  @Column('varchar', { length: 50, comment: '角色名称' })
  name: string;

  @Column('varchar', { length: 50, comment: '角色编号' })
  code: string;

  @Column('varchar', { length: 255, comment: '备注', nullable: true })
  remark: string;

  @Column('tinyint', {
    comment: '是否是系统内置，系统内置的角色无法修改和删除',
    unsigned: true,
    default: MerchantStaffIsSystemRoleEnum.FALSE,
  })
  systemRole: MerchantStaffIsSystemRoleEnum;

  @ManyToMany(
    () => MerchantStaffEntity,
    user => user.roles,
  )
  staffs?: MerchantStaffEntity[] | undefined;

  @ManyToMany(() => MerchantStaffMenuEntity)
  @JoinTable({ name: MerchantStaffRoleEntity.MerchantStaffRoleMenuTable })
  menus?: MerchantStaffMenuEntity[] | undefined;

  @ManyToMany(() => MerchantStaffPermEntity)
  @JoinTable({ name: MerchantStaffRoleEntity.MerchantStaffRolePermTable })
  permissions?: MerchantStaffPermEntity[] | undefined;
}
