import { Scope, Entity, Column } from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';

export enum MerchantCouponTypeEnum {
  FULL_REDUCTION = 10, // 满减券
  DISCOUNT = 20, // 折扣券
}

export enum MerchantCouponColorEnum {
  RED = 10, // 红
  BLUE = 20, // 蓝
  YELLOW = 30, // 黄
  GREEN = 40, // 绿
  PURPLE = 50, // 紫
}

export enum MerchantCouponExpireTypeEnum {
  AFTER_RECEIVING = 10, // 领取后生效
  FIXED_TIME = 20, // 固定时间段
}

@Scope<MerchantCouponEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_coupon', { database: MEELUO_SHOP_DATABASE })
export class MerchantCouponEntity extends MerchantBaseEntity {
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

  @Column('timestamp', { comment: '固定时间段-开始时间', nullable: true })
  startTime: Date;

  @Column('timestamp', { comment: '固定时间段-结束时间', nullable: true })
  endTime: Date;

  @Column('int', {
    comment: '已领取数量',
    unsigned: true,
    default: 0,
  })
  receiveNum: number;

  @Column('int', {
    comment: '优惠券顺序',
    unsigned: true,
    nullable: true,
    default: 100,
  })
  order: number;
}
