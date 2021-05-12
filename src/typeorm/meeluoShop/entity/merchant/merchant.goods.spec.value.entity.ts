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
import { MerchantGoodsSpecEntity } from './merchant.goods.spec.entity';

@Scope<MerchantGoodsSpecValueEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_goods_spec_value', { database: MEELUO_SHOP_DATABASE })
export class MerchantGoodsSpecValueEntity extends MerchantBaseEntity {
  @Column('varchar', { length: 255, comment: '规格值' })
  value: string;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  specId: number;

  @ManyToOne(() => MerchantGoodsSpecEntity)
  @JoinColumn({ name: 'spec_id', referencedColumnName: 'id' })
  spec?: MerchantGoodsSpecEntity | undefined;
}
