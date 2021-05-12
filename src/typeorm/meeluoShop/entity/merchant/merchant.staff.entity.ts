import {
  Column,
  Scope,
  Entity,
  BeforeInsert,
  ManyToMany,
  JoinTable,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { CryptoHelperProvider } from '@shared/helper';
import { MerchantBaseEntity } from './merchant.base.entity';
import { MerchantStaffRoleEntity } from './merchant.staff.role.entity';
import { WechatUserEntity } from '../wechat';

export enum MerchantStaffIsNativeEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum MerchantStaffIsActiveEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<MerchantStaffEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_staff', { database: MEELUO_SHOP_DATABASE })
export class MerchantStaffEntity extends MerchantBaseEntity {
  static MerchantStaffRoleTable = 'merchant_staff_role_mapping';

  @Column('varchar', {
    comment: '公众号openid(唯一标识)',
    length: 50,
    nullable: true,
  })
  openid: string;

  @Column('varchar', { length: 255, comment: '用户名', nullable: true })
  username: string;

  @Column('varchar', { comment: '密码', length: 255 })
  password: string;

  @Column('varchar', { comment: '员工姓名', length: 50, nullable: true })
  nickname: string;

  @Column('varchar', { comment: '员工工号', length: 50, nullable: true })
  staffNo: string;

  @Column('varchar', { length: 255, comment: '头像', nullable: true })
  avatar: string;

  @Column('tinyint', {
    comment: '是否是创建商户时的指定用户',
    unsigned: true,
    default: MerchantStaffIsNativeEnum.FALSE,
  })
  isNative: MerchantStaffIsNativeEnum;

  @Column('tinyint', {
    comment: '是否启用',
    unsigned: true,
    default: MerchantStaffIsActiveEnum.TRUE,
  })
  isActive: MerchantStaffIsActiveEnum;

  @Column('varchar', { comment: '电子邮箱', nullable: true, length: 50 })
  email: string;

  @Column('varchar', { comment: '手机号码', length: 50 })
  phone: string;

  @Column('timestamp', { comment: '首次登陆时间', nullable: true })
  firstLoginTime?: Date;

  @Column('timestamp', { comment: '最后一次登陆时间', nullable: true })
  lastLoginTime: Date;

  wechatUser?: WechatUserEntity;

  @ManyToMany(
    () => MerchantStaffRoleEntity,
    role => role.staffs,
  )
  @JoinTable({ name: MerchantStaffEntity.MerchantStaffRoleTable })
  roles?: MerchantStaffRoleEntity[] | undefined;

  @BeforeInsert()
  transformColumnValue() {
    this.password = CryptoHelperProvider.hash(this.password);
  }
}
