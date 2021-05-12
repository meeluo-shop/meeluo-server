import {
  Scope,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from '@jiaxinjiang/nest-orm';
import { MerchantBaseEntity } from './merchant.base.entity';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { WechatUserEntity, WechatUserGenderEnum } from '../wechat';
import { idTransformer } from '@typeorm/base.entity';
import { MerchantUserAddressEntity } from './merchant.user.address.entity';
import { MerchantUserGradeEntity } from './merchant.user.grade.entity';

export enum MerchantUserIsActiveEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<MerchantUserEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_user', { database: MEELUO_SHOP_DATABASE })
@Index(['openid', 'merchantId'], { unique: true })
export class MerchantUserEntity extends MerchantBaseEntity {
  @Column('varchar', {
    comment: '微信公众号openid',
    length: 50,
    nullable: true,
  })
  openid: string;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  gradeId: number;

  @Column('varchar', {
    comment: '微信用户昵称',
    length: 128,
    nullable: true,
    default: '',
  })
  nickname: string;

  @Column('varchar', {
    comment: '微信用户头像',
    length: 512,
    nullable: true,
  })
  avatar: string;

  @Column('tinyint', {
    comment: '性别',
    unsigned: true,
    default: WechatUserGenderEnum.UNKNOWN,
  })
  gender: WechatUserGenderEnum;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '用户余额',
    unsigned: true,
    default: 0,
  })
  balance: number;

  @Column({
    type: 'int',
    comment: '用户积分',
    unsigned: true,
    default: 0,
  })
  point: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '充值总金额',
    unsigned: true,
    default: 0,
  })
  totalRecharge: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '真实充值总金额（微信充值到账金额）',
    unsigned: true,
    default: 0,
  })
  realTotalRecharge: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '消费总金额',
    unsigned: true,
    default: 0,
  })
  totalConsumption: number;

  @Column('varchar', { comment: '手机号码', length: 50, nullable: true })
  phone: string;

  @Column({
    type: 'int',
    comment: '登陆次数',
    unsigned: true,
    default: 0,
  })
  loginCount: number;

  @Column('timestamp', { comment: '首次登陆时间', nullable: true })
  firstLoginTime: Date;

  @Column('timestamp', { comment: '最后一次登陆时间', nullable: true })
  lastLoginTime: Date;

  @Column('bigint', { comment: '邀请人的用户id', unsigned: true, nullable: true, transformer: idTransformer })
  inviteUserId: number;

  @Column('tinyint', {
    comment: '是否启用',
    unsigned: true,
    default: MerchantUserIsActiveEnum.TRUE,
  })
  isActive: MerchantUserIsActiveEnum;

  @ManyToOne(() => MerchantUserGradeEntity)
  @JoinColumn({ name: 'grade_id', referencedColumnName: 'id' })
  grade: MerchantUserGradeEntity;

  @ManyToOne(() => WechatUserEntity)
  @JoinColumn({ name: 'openid', referencedColumnName: 'openid' })
  wechatUser: WechatUserEntity;

  @OneToMany(
    () => MerchantUserAddressEntity,
    address => address.merchantUser,
  )
  @JoinColumn()
  addresses?: MerchantUserAddressEntity[] | undefined;
}
