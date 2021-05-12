import {
  Column,
  Entity,
  ManyToOne,
  Scope,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';
import { idTransformer } from '@typeorm/base.entity';
import {
  MerchantGoodsCategoryEntity,
  MerchantGoodsTypeEnum,
} from './merchant.goods.category.entity';
import { CommonResourceEntity } from '../common/common.resource.entity';
import { MerchantDeliveryEntity } from './merchant.delivery.entity';
import { MerchantGoodsSkuEntity } from './merchant.goods.sku.entity';
import { MerchantGoodsSpecMappingEntity } from './merchant.goods.spec.mapping.entity';
import { MerchantCouponEntity } from './merchant.coupon.entity';

export enum MerchantGoodsSpecTypeEnum {
  SINGLE = 10, // 单规格
  MULTI = 20, // 多规格
}

export enum MerchantGoodsIsPointsDiscountEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum MerchantGoodsIsPointsGiftEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum MerchantGoodsIsEnableGradeEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum MerchantGoodsIsActiveEnum {
  TRUE = 1,
  FALSE = 0,
}

// 作为奖品的领取方式
export enum MerchantGoodsPrizeGetMethodsEnum {
  INSTORE = 10, // 店内领取
  DISTRIBUTION = 20, // 邮寄配送
}

@Scope<MerchantGoodsEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_goods', { database: MEELUO_SHOP_DATABASE })
export class MerchantGoodsEntity extends MerchantBaseEntity {
  static MerchantGoodsImage = 'merchant_goods_image';

  @Column('varchar', { length: 255, comment: '商品名称' })
  name: string;

  @Column('varchar', { length: 500, nullable: true, comment: '商品卖点' })
  sellingPoint: string;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    comment: '产品缩略图',
    transformer: idTransformer,
  })
  thumbnailId: number;

  @Column('varchar', {
    length: 20,
    nullable: true,
    comment: '商品单位，针对菜品，例：份',
  })
  unit: string;

  @Column('int', {
    comment: '每桌/人限购数量，0为不限制',
    unsigned: true,
    nullable: true,
    default: 0,
  })
  limit: number;

  @Column('tinyint', {
    comment: '规格类型，10单规格，20多规格，默认10',
    unsigned: true,
    default: MerchantGoodsSpecTypeEnum.SINGLE,
  })
  specType: MerchantGoodsSpecTypeEnum;

  @Column('longtext', { nullable: true, comment: '商品详情' })
  content: string;

  @Column('int', { comment: '初始销量', default: 0 })
  salesInitial: number;

  @Column('int', { comment: '实际销量', default: 0 })
  salesActual: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '商品规格最高价格，价格条件筛选用',
    default: 0,
    unsigned: true,
  })
  maxPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '商品规格最低价格，价格条件筛选用',
    default: 0,
    unsigned: true,
  })
  minPrice: number;

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

  @Column('tinyint', {
    comment: '是否上架，默认1',
    unsigned: true,
    default: MerchantGoodsIsActiveEnum.TRUE,
  })
  isActive: MerchantGoodsIsActiveEnum;

  @Column('tinyint', {
    comment: '作为奖品的领取方式，10店内领取，20邮寄配送，默认20',
    unsigned: true,
    default: MerchantGoodsPrizeGetMethodsEnum.DISTRIBUTION,
  })
  prizeGetMethods: MerchantGoodsPrizeGetMethodsEnum;

  @Column('tinyint', {
    comment: '商品类型，10 商品 20 菜品，默认10',
    unsigned: true,
    default: MerchantGoodsTypeEnum.GOODS,
  })
  type: MerchantGoodsTypeEnum;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '包装费用，针对点餐外卖有效，不收为0',
    default: 0,
    unsigned: true,
  })
  packingFee: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  categoryId: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    comment: '模板配送id',
    transformer: idTransformer,
  })
  deliveryId: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    comment: '购买后赠送的优惠券id',
    transformer: idTransformer,
  })
  giftCouponId: number;

  @Column('int', {
    comment: '商品顺序',
    unsigned: true,
    nullable: true,
    default: 100,
  })
  order: number;

  @OneToMany(
    () => MerchantGoodsSkuEntity,
    sku => sku.goods,
  )
  @JoinColumn()
  skus?: MerchantGoodsSkuEntity[] | undefined;

  @OneToMany(
    () => MerchantGoodsSpecMappingEntity,
    mapping => mapping.goods,
  )
  @JoinColumn()
  specMappings?: MerchantGoodsSpecMappingEntity[] | undefined;

  @ManyToMany(() => CommonResourceEntity)
  @JoinTable({ name: MerchantGoodsEntity.MerchantGoodsImage })
  images?: CommonResourceEntity[] | undefined;

  @ManyToOne(() => MerchantCouponEntity)
  @JoinColumn({ name: 'gift_coupon_id', referencedColumnName: 'id' })
  giftCoupon?: MerchantCouponEntity | undefined;

  @ManyToOne(() => MerchantDeliveryEntity)
  @JoinColumn({ name: 'delivery_id', referencedColumnName: 'id' })
  delivery?: MerchantDeliveryEntity | undefined;

  @ManyToOne(() => CommonResourceEntity)
  @JoinColumn({ name: 'thumbnail_id', referencedColumnName: 'id' })
  thumbnail?: CommonResourceEntity | undefined;

  @ManyToOne(() => MerchantGoodsCategoryEntity)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category?: MerchantGoodsCategoryEntity | undefined;
}
