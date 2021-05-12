import {
  Column,
  Scope,
  Entity,
  JoinColumn,
  ManyToOne,
  Index,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';
import { MerchantGoodsEntity } from './merchant.goods.entity';
import { idTransformer } from '@typeorm/base.entity';
import { CommonResourceEntity } from '../common/common.resource.entity';

@Scope<MerchantGoodsSkuEntity>([{ column: 'is_delete', value: 0 }])
@Index(['goodsId', 'specSkuId'], { unique: true })
@Entity('merchant_goods_sku', { database: MEELUO_SHOP_DATABASE })
export class MerchantGoodsSkuEntity extends MerchantBaseEntity {
  @Column('varchar', { length: 100, comment: '商品编号' })
  number: string;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  imageId: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '商品价格',
    default: 0,
    unsigned: true,
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '商品划线价格',
    default: 0,
    unsigned: true,
  })
  linePrice: number;

  @Column('int', {
    comment: '当前库存数量',
    unsigned: true,
    nullable: true,
    default: 0,
  })
  stock: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 4,
    comment: '商品重量(Kg)',
    default: 0,
    unsigned: true,
  })
  weight: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  goodsId: number;

  @Column('varchar', {
    length: 255,
    nullable: true,
    comment: '商品sku记录索引 (由规格id组成)',
  })
  specSkuId: string;

  @ManyToOne(() => CommonResourceEntity)
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image?: CommonResourceEntity | undefined;

  @ManyToOne(() => MerchantGoodsEntity)
  @JoinColumn({ name: 'goods_id', referencedColumnName: 'id' })
  goods?: MerchantGoodsEntity | undefined;
}
