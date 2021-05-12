import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Scope,
} from '@jiaxinjiang/nest-orm';
import { idTransformer } from '@typeorm/base.entity';
import { MerchantBaseEntity } from './merchant.base.entity';
import { MerchantCouponGrantEntity } from './merchant.coupon.grant.entity';
import { MerchantOrderAddressEntity } from './merchant.order.address.entity';
import { MerchantOrderExtractEntity } from './merchant.order.extract.entity';
import { MerchantOrderGoodsEntity } from './merchant.order.goods.entity';
import { MerchantUserEntity } from './merchant.user.entity';

export enum MerchantOrderPayTypeEnum {
  WECHAT = 10,
  BALANCE = 20,
}

export enum MerchantOrderPayStatusEnum {
  NOT_PAID = 10,
  PAID = 20,
}

export enum MerchantOrderDeliveryTypeEnum {
  DISTRIBUTION = 20, // 邮寄配送
  INSTORE = 10, // 店内领取
}

export enum MerchantOrderDeliveryStatusEnum {
  NO_DELIVERED = 10,
  DELIVERED = 20,
}

export enum MerchantOrderReceiptStatusEnum {
  NO_RECEIPTED = 10,
  RECEIPTED = 20,
}

export enum MerchantOrderIsCommentEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum MerchantOrderStatusEnum {
  IN_PROCESS = 10,
  CANCEL = 20,
  WAIT_CANCEL = 21,
  SUCCESS = 30,
}

@Scope<MerchantOrderEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_order', { database: MEELUO_SHOP_DATABASE })
export class MerchantOrderEntity extends MerchantBaseEntity {
  @Index({ unique: true })
  @Column('varchar', { length: 20, comment: '订单号' })
  orderNo: string;

  @Column('bigint', {
    comment: '微信支付交易号',
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  wechatPaymentOrderId?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '商品总金额(不含优惠折扣)',
    default: 0,
    unsigned: true,
  })
  totalPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '订单金额(含优惠折扣)',
    default: 0,
    unsigned: true,
  })
  orderPrice: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  couponId: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '优惠券抵扣金额',
    default: 0,
    unsigned: true,
  })
  couponMoney: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '积分抵扣金额',
    default: 0,
    unsigned: true,
  })
  pointsMoney: number;

  @Column({
    type: 'int',
    comment: '积分抵扣数量',
    default: 0,
    unsigned: true,
  })
  pointsNum: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '实际付款金额(包含运费)',
    default: 0,
    unsigned: true,
  })
  payPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '后台修改的订单金额',
    unsigned: true,
    nullable: true,
  })
  updatePrice: number;

  @Column('varchar', { length: 255, nullable: true, comment: '买家留言' })
  buyerRemark: string;

  @Column('tinyint', {
    comment: '支付方式(10微信支付 20余额支付)，默认10',
    unsigned: true,
    default: MerchantOrderPayTypeEnum.WECHAT,
  })
  payType: MerchantOrderPayTypeEnum;

  @Column('tinyint', {
    comment: '付款状态(10未付款 20已付款)，默认10',
    unsigned: true,
    default: MerchantOrderPayStatusEnum.NOT_PAID,
  })
  payStatus: MerchantOrderPayStatusEnum;

  @Column('tinyint', {
    comment: '配送方式(20快递配送 10上门自提)，默认20',
    unsigned: true,
    default: MerchantOrderDeliveryTypeEnum.DISTRIBUTION,
  })
  deliveryType: MerchantOrderDeliveryTypeEnum;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '运费金额',
    default: 0,
    unsigned: true,
  })
  expressPrice: number;

  @Column('timestamp', { comment: '付款时间', nullable: true })
  payTime: Date;

  @Column('tinyint', {
    comment: '发货状态(10未发货 20已发货)，默认10',
    unsigned: true,
    default: MerchantOrderDeliveryStatusEnum.NO_DELIVERED,
  })
  deliveryStatus: MerchantOrderDeliveryStatusEnum;

  @Column('timestamp', { comment: '发货时间', nullable: true })
  deliveryTime: Date;

  @Column('tinyint', {
    comment: '收货状态(10未收货 20已收货)，默认10',
    unsigned: true,
    default: MerchantOrderReceiptStatusEnum.NO_RECEIPTED,
  })
  receiptStatus: MerchantOrderReceiptStatusEnum;

  @Column('timestamp', { comment: '收货时间', nullable: true })
  receiptTime: Date;

  @Column('tinyint', {
    comment: '订单状态(10进行中 20取消 21待取消 30已完成)，默认10',
    unsigned: true,
    default: MerchantOrderStatusEnum.IN_PROCESS,
  })
  orderStatus: MerchantOrderStatusEnum;

  @Column('tinyint', {
    comment: '是否已评价，1是 0否',
    unsigned: true,
    default: MerchantOrderIsCommentEnum.FALSE,
  })
  isComment: MerchantOrderIsCommentEnum;

  @Column({
    type: 'int',
    comment: '赠送的积分数量',
    default: 0,
    unsigned: true,
  })
  pointsBonus: number;

  @Column('bigint', {
    comment: '用户id',
    unsigned: true,
    transformer: idTransformer,
  })
  merchantUserId: number;

  orderGoodsList: MerchantOrderGoodsEntity[];

  orderAddress: MerchantOrderAddressEntity;

  orderExtract: MerchantOrderExtractEntity;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser?: MerchantUserEntity;

  @ManyToOne(() => MerchantCouponGrantEntity)
  @JoinColumn({ name: 'coupon_id', referencedColumnName: 'id' })
  coupon?: MerchantCouponGrantEntity | undefined;
}
