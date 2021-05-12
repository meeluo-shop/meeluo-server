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
  MerchantGoodsPrizeGetMethodsEnum,
  MerchantGoodsSpecTypeEnum,
} from './merchant.goods.entity';
import { MerchantGameWinningEntity } from './merchant.game.winning.entity';
import { MerchantGameWinningExpressEntity } from './merchant.game.winning.express.entity';
import { MerchantCouponEntity } from './merchant.coupon.entity';

@Scope<MerchantGameWinningGoodsEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_game_winning_goods', { database: MEELUO_SHOP_DATABASE })
export class MerchantGameWinningGoodsEntity extends MerchantBaseEntity {
  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  winningId: number;

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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '商品金额',
    default: 0,
    unsigned: true,
  })
  price: number;

  @Column('tinyint', {
    comment: '规格类型，10单规格，20多规格，默认10',
    unsigned: true,
    default: MerchantGoodsSpecTypeEnum.SINGLE,
  })
  specType: MerchantGoodsSpecTypeEnum;

  @Column('longtext', { nullable: true, comment: '商品详情' })
  content: string;

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

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    comment: '获奖后赠送的优惠券id',
    transformer: idTransformer,
  })
  giftCouponId: number;

  @Column('tinyint', {
    comment: '作为奖品的领取方式，10店内领取，20邮寄配送，默认20',
    unsigned: true,
    default: MerchantGoodsPrizeGetMethodsEnum.DISTRIBUTION,
  })
  prizeGetMethods: MerchantGoodsPrizeGetMethodsEnum;

  @ManyToOne(() => MerchantGoodsEntity)
  @JoinColumn({ name: 'goods_id', referencedColumnName: 'id' })
  goods: MerchantGoodsEntity;

  @ManyToOne(() => MerchantGameWinningEntity)
  @JoinColumn({ name: 'winning_id', referencedColumnName: 'id' })
  winning?: MerchantGameWinningEntity;

  @ManyToOne(() => MerchantCouponEntity)
  @JoinColumn({ name: 'gift_coupon_id', referencedColumnName: 'id' })
  giftCoupon?: MerchantCouponEntity | undefined;

  @OneToOne(
    () => MerchantGameWinningExpressEntity,
    winningExpress => winningExpress.winningGoods,
  )
  winningExpress?: MerchantGameWinningExpressEntity;
}
