import {
  Column,
  Scope,
  Entity,
  ManyToMany,
  JoinTable,
  BeforeInsert,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { CryptoHelperProvider } from '@shared/helper';
import { BaseEntity } from '@typeorm/base.entity';
import { AdminRoleEntity } from './admin.role.entity';

export enum AdminUserGenderEnum {
  UNKNOWN = 0,
  MAN = 1,
  WOMAN = 2,
}

export enum AdminIsSuperuserEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum AdminIsActiveEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<AdminUserEntity>([{ column: 'is_delete', value: 0 }])
@Entity('admin_user', { database: MEELUO_SHOP_DATABASE })
export class AdminUserEntity extends BaseEntity {
  static userRoleMappingTable = 'admin_user_role_mapping';

  @Column('varchar', {
    comment: '公众号openid(唯一标识)',
    length: 50,
    nullable: true,
  })
  openid: string;

  @Column('varchar', { length: 255, comment: '用户名' })
  username: string;

  @Column('varchar', { comment: '密码', length: 255 })
  password: string;

  @Column('varchar', { comment: '真实姓名', length: 50, nullable: true })
  realname: string;

  @Column('varchar', { comment: '用户昵称', length: 50, nullable: true })
  nickname: string;

  @Column('varchar', { length: 255, comment: '头像', nullable: true })
  avatar: string;

  @Column('tinyint', {
    comment: '性别',
    unsigned: true,
    default: AdminUserGenderEnum.UNKNOWN,
  })
  gender: AdminUserGenderEnum;

  @Column('tinyint', {
    comment: '是否是超级管理员',
    unsigned: true,
    default: AdminIsSuperuserEnum.FALSE,
  })
  isSuperuser: AdminIsSuperuserEnum;

  @Column('tinyint', {
    comment: '是否启用',
    unsigned: true,
    default: AdminIsActiveEnum.TRUE,
  })
  isActive: AdminIsActiveEnum;

  @Column('varchar', { comment: '电子邮箱', length: 50, nullable: true })
  email: string;

  @Column('varchar', { comment: '手机号码', length: 50, nullable: true })
  mobile: string;

  @Column('timestamp', { comment: '首次登陆时间', nullable: true })
  firstLoginTime: Date;

  @Column('timestamp', { comment: '最后一次登陆时间', nullable: true })
  lastLoginTime: Date;

  @ManyToMany(
    () => AdminRoleEntity,
    role => role.users,
  )
  @JoinTable({ name: AdminUserEntity.userRoleMappingTable })
  roles?: AdminRoleEntity[] | undefined;

  @BeforeInsert()
  transformColumnValue() {
    if (this.password) {
      this.password = CryptoHelperProvider.hash(this.password);
    }
  }
}
