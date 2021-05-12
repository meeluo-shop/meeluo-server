import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Scope,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';
import { idTransformer } from '@typeorm/base.entity';
import {
  MerchantGoodsEntity,
  MerchantGoodsIsEnableGradeEnum,
  MerchantGoodsIsPointsDiscountEnum,
  MerchantGoodsIsPointsGiftEnum,
  MerchantGoodsSpecTypeEnum,
} from './merchant.goods.entity';
import { MerchantOrderEntity } from './merchant.order.entity';
import { MerchantUserEntity } from './merchant.user.entity';
import { MerchantOrderExpressEntity } from './merchant.order.express.entity';
import { MerchantCouponEntity } from './merchant.coupon.entity';

export enum MerchantOrderGoodsIsCommentEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<MerchantOrderGoodsEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_order_goods', { database: MEELUO_SHOP_DATABASE })
export class MerchantOrderGoodsEntity extends MerchantBaseEntity {
  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  orderId: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  goodsId: number;

  @Column('varchar', { length: 255, comment: '商品名称' })
  name: string;

  @Column('varchar', { length: 500, nullable: true, comment: '商品卖点' })
  sellingPoint: string;

  @Column('varchar', { length: 500, nullable: true, comment: '产品缩略图' })
  thumbnailUrl: string;

  @Column('tinyint', {
    comment: '规格类型，10单规格，20多规格，默认10',
    unsigned: true,
    default: MerchantGoodsSpecTypeEnum.SINGLE,
  })
  specType: MerchantGoodsSpecTypeEnum;

  @Column('longtext', { nullable: true, comment: '商品详情' })
  content: string;

  @Column('tinyint', {
    comment: '是否允许使用积分抵扣(1允许 0不允许)，默认0',
    unsigned: true,
    default: MerchantGoodsIsPointsDiscountEnum.FALSE,
  })
  isPointsDiscount: MerchantGoodsIsPointsDiscountEnum;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '最高积分抵扣额度（元）',
    default: 0,
  })
  maxPointsDiscountAmount: number;

  @Column('tinyint', {
    comment: '是否开启积分赠送(1开启 0关闭)，默认0',
    unsigned: true,
    default: MerchantGoodsIsPointsGiftEnum.FALSE,
  })
  isPointsGift: MerchantGoodsIsPointsGiftEnum;

  @Column('tinyint', {
    comment: '是否开启会员折扣(1开启 0关闭)，默认0',
    unsigned: true,
    default: MerchantGoodsIsEnableGradeEnum.FALSE,
  })
  isEnableGrade: MerchantGoodsIsEnableGradeEnum;

  @Column('varchar', {
    length: 255,
    nullable: true,
    comment: '商品sku记录索引 (由规格id组成)',
  })
  specSkuId: string;

  @Column('varchar', {
    length: 500,
    nullable: true,
    comment: '商品规格信息',
  })
  specs: string;

  @Column('varchar', {
    length: 100,
    nullable: true,
    comment: '商品编码',
  })
  goodsNo: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '商品价格(单价)（元）',
    default: 0,
  })
  goodsPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '商品划线价(单价)（元）',
    default: 0,
  })
  goodsLinePrice: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 4,
    comment: '商品重量(Kg)',
    default: 0,
    unsigned: true,
  })
  goodsWeight: number;

  @Column('tinyint', {
    comment: '会员等级抵扣比例',
    unsigned: true,
    default: 0,
  })
  gradeRatio: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '会员折扣的商品单价（元）',
    default: 0,
  })
  gradeGoodsMoney: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '会员折扣的总额价（元）',
    default: 0,
  })
  gradeTotalMoney: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '优惠券折扣金额（元）',
    default: 0,
  })
  couponMoney: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    comment: '购买后赠送的优惠券id',
    transformer: idTransformer,
  })
  giftCouponId: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '积分抵扣金额（元）',
    default: 0,
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
    type: 'int',
    comment: '赠送的积分数量',
    default: 0,
    unsigned: true,
  })
  pointsBonus: number;

  @Column({
    type: 'int',
    comment: '商品购买数量',
    default: 1,
    unsigned: true,
  })
  totalNum: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '商品总价(数量×单价)（元）',
    default: 0,
  })
  totalPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '实际付款价(折扣和优惠后)（元）',
    default: 0,
  })
  totalPayPrice: number;

  @Column('tinyint', {
    comment: '是否已评论，1是 0否',
    unsigned: true,
    default: MerchantOrderGoodsIsCommentEnum.FALSE,
  })
  isComment: MerchantOrderGoodsIsCommentEnum;

  @Column('bigint', {
    comment: '订单商品核销人员id',
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  extractClerkId: number;

  @Column('bigint', { unsigned: true, transformer: idTransformer })
  merchantUserId: number;

  @OneToOne(
    () => MerchantOrderExpressEntity,
    orderExpress => orderExpress.orderGoods,
  )
  orderExpress?: MerchantOrderExpressEntity;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser: MerchantUserEntity;

  @ManyToOne(() => MerchantCouponEntity)
  @JoinColumn({ name: 'gift_coupon_id', referencedColumnName: 'id' })
  giftCoupon?: MerchantCouponEntity | undefined;

  @ManyToOne(() => MerchantGoodsEntity)
  @JoinColumn({ name: 'goods_id', referencedColumnName: 'id' })
  goods: MerchantGoodsEntity;

  @ManyToOne(() => MerchantOrderEntity)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order?: MerchantOrderEntity;
}
