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
import { MerchantMenuOrderGoodsEntity } from './merchant.menu.order.goods.entity';
import { MerchantUserEntity } from './merchant.user.entity';

export enum MerchantMenuOrderPayTypeEnum {
  WECHAT = 10,
  BALANCE = 20,
}

export enum MerchantMenuOrderPayStatusEnum {
  NOT_PAID = 10,
  PAID = 20,
  OFFLINE_PAY = 30,
}

export enum MerchantMenuOrderDeliveryStatusEnum {
  NO_DELIVERED = 10, // 烹制中
  DELIVERED = 20, // 上餐中
}

export enum MerchantMenuOrderReceiptStatusEnum {
  NO_RECEIPTED = 10, // 用餐中
  RECEIPTED = 20, // 用餐结束
}

export enum MerchantMenuOrderIsCommentEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum MerchantMenuOrderStatusEnum {
  IN_PROCESS = 10,
  CANCEL = 20,
  WAIT_CANCEL = 21,
  SUCCESS = 30,
}

@Scope<MerchantMenuOrderEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_menu_order', { database: MEELUO_SHOP_DATABASE })
export class MerchantMenuOrderEntity extends MerchantBaseEntity {
  @Index({ unique: true })
  @Column('varchar', { length: 20, comment: '订单号' })
  orderNo: string;

  @Column('int', {
    comment: '用户订单排号',
    unsigned: true,
    nullable: true,
    default: 0,
  })
  rowNo: number;

  @Column('bigint', {
    comment: '微信支付交易号',
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  wechatPaymentOrderId?: number;

  @Index()
  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
    comment: '餐桌/包间id',
  })
  tableId: number;

  @Column('varchar', { length: 50, nullable: true, comment: '餐桌/包间名' })
  tableName: string;

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
    comment: '实际付款金额(包含餐具/调料费)',
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
    default: MerchantMenuOrderPayTypeEnum.WECHAT,
  })
  payType: MerchantMenuOrderPayTypeEnum;

  @Column('tinyint', {
    comment: '付款状态(10未付款 20已付款 30餐后支付)，默认10',
    unsigned: true,
    default: MerchantMenuOrderPayStatusEnum.NOT_PAID,
  })
  payStatus: MerchantMenuOrderPayStatusEnum;

  @Column('timestamp', { comment: '付款时间', nullable: true })
  payTime: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '餐具/调料费',
    default: 0,
    unsigned: true,
  })
  wareFee: number;

  @Column('int', {
    comment: '就餐人数',
    unsigned: true,
    nullable: true,
    default: 1,
  })
  people: number;

  @Column('tinyint', {
    comment: '上餐状态(10烹制中 20上餐中)，默认10',
    unsigned: true,
    default: MerchantMenuOrderDeliveryStatusEnum.NO_DELIVERED,
  })
  deliveryStatus: MerchantMenuOrderDeliveryStatusEnum;

  @Column('timestamp', { comment: '上餐时间', nullable: true })
  deliveryTime: Date;

  @Column('tinyint', {
    comment: '用餐状态(10用餐中 20用餐完毕)',
    unsigned: true,
    default: MerchantMenuOrderReceiptStatusEnum.NO_RECEIPTED,
  })
  receiptStatus: MerchantMenuOrderReceiptStatusEnum;

  @Column('timestamp', { comment: '用餐完毕时间', nullable: true })
  receiptTime: Date;

  @Column('tinyint', {
    comment: '订单状态(10进行中 20取消 21待取消 30已完成)，默认10',
    unsigned: true,
    default: MerchantMenuOrderStatusEnum.IN_PROCESS,
  })
  orderStatus: MerchantMenuOrderStatusEnum;

  @Column('tinyint', {
    comment: '是否已评价，1是 0否',
    unsigned: true,
    default: MerchantMenuOrderIsCommentEnum.FALSE,
  })
  isComment: MerchantMenuOrderIsCommentEnum;

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
    nullable: true,
    transformer: idTransformer,
  })
  merchantUserId: number;

  orderGoodsList: MerchantMenuOrderGoodsEntity[];

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser?: MerchantUserEntity;

  @ManyToOne(() => MerchantCouponGrantEntity)
  @JoinColumn({ name: 'coupon_id', referencedColumnName: 'id' })
  coupon?: MerchantCouponGrantEntity | undefined;
}
