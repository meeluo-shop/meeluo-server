import {
  Column,
  Scope,
  Entity,
  ManyToOne,
  JoinColumn,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';
import { idTransformer } from '@typeorm/base.entity';
import { MerchantGoodsEntity } from './merchant.goods.entity';
import { MerchantGoodsSpecEntity } from './merchant.goods.spec.entity';
import { MerchantGoodsSpecValueEntity } from './merchant.goods.spec.value.entity';

@Scope<MerchantGoodsSpecMappingEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_goods_spec_mapping', { database: MEELUO_SHOP_DATABASE })
export class MerchantGoodsSpecMappingEntity extends MerchantBaseEntity {
  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  goodsId: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  specId: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  specValueId: number;

  @ManyToOne(() => MerchantGoodsEntity)
  @JoinColumn({ name: 'goods_id', referencedColumnName: 'id' })
  goods?: MerchantGoodsEntity | undefined;

  @ManyToOne(() => MerchantGoodsSpecEntity)
  @JoinColumn({ name: 'spec_id', referencedColumnName: 'id' })
  spec?: MerchantGoodsSpecEntity | undefined;

  @ManyToOne(() => MerchantGoodsSpecValueEntity)
  @JoinColumn({ name: 'spec_value_id', referencedColumnName: 'id' })
  specValue?: MerchantGoodsSpecValueEntity | undefined;
}
