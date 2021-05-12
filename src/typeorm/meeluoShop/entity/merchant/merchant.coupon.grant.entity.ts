import {
  Scope,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';
import { idTransformer } from '@typeorm/base.entity';
import {
  MerchantCouponEntity,
  MerchantCouponExpireTypeEnum,
  MerchantCouponTypeEnum,
  MerchantCouponColorEnum,
} from './merchant.coupon.entity';
import { MerchantUserEntity } from './merchant.user.entity';

export enum MerchantCouponIsUsedEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<MerchantCouponGrantEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_coupon_grant', { database: MEELUO_SHOP_DATABASE })
export class MerchantCouponGrantEntity extends MerchantBaseEntity {
  @Column('bigint', {
    unsigned: true,
    transformer: idTransformer,
  })
  couponId: number;

  @Column('bigint', { unsigned: true, transformer: idTransformer })
  merchantUserId: number;

  @Column('varchar', { length: 255, comment: '优惠券名称' })
  name: string;

  @Column('tinyint', {
    comment: '优惠券颜色，10红，20蓝，30黄，40绿，50紫，默认20',
    unsigned: true,
    default: MerchantCouponColorEnum.BLUE,
  })
  color: MerchantCouponColorEnum;

  @Column('tinyint', {
    comment: '优惠券类型，10满减券，20折扣券，默认10',
    unsigned: true,
    default: MerchantCouponTypeEnum.FULL_REDUCTION,
  })
  type: MerchantCouponTypeEnum;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '满减券-满减金额（元）',
    default: 0,
  })
  reducePrice: number;

  @Column('tinyint', {
    comment: '折扣券-折扣率（0-100）',
    default: 0,
  })
  discount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '最低消费金额（元）',
    default: 0,
  })
  minPrice: number;

  @Column('tinyint', {
    comment: '有效期类型，10领取后生效，20固定时间段，默认10',
    unsigned: true,
    default: MerchantCouponExpireTypeEnum.AFTER_RECEIVING,
  })
  expireType: MerchantCouponExpireTypeEnum;

  @Column('int', {
    comment: '领取后生效-有效天数',
    unsigned: true,
    nullable: true,
    default: 0,
  })
  expireDay: number;

  @Column('timestamp', { comment: '领取后生效-有效期结束时间', nullable: true })
  expireTime: Date;

  @Column('timestamp', { comment: '固定时间段-开始时间', nullable: true })
  startTime: Date;

  @Column('timestamp', { comment: '固定时间段-结束时间', nullable: true })
  endTime: Date;

  @Column('tinyint', {
    comment: '是否使用（1是，0否），默认0',
    unsigned: true,
    default: MerchantCouponIsUsedEnum.FALSE,
  })
  isUsed: MerchantCouponIsUsedEnum;

  @Column('bigint', {
    comment: '发放员工id',
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  staffId: number;

  @ManyToOne(() => MerchantCouponEntity)
  @JoinColumn({ name: 'coupon_id', referencedColumnName: 'id' })
  coupon?: MerchantCouponEntity | undefined;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser: MerchantUserEntity;
}
