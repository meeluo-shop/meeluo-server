import {
  Column,
  Scope,
  Entity,
  OneToMany,
  JoinColumn,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';
import { MerchantGoodsSpecValueEntity } from './merchant.goods.spec.value.entity';

@Scope<MerchantGoodsSpecEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_goods_spec', { database: MEELUO_SHOP_DATABASE })
export class MerchantGoodsSpecEntity extends MerchantBaseEntity {
  @Column('varchar', { length: 255, comment: '规格名称' })
  name: string;

  @OneToMany(
    () => MerchantGoodsSpecValueEntity,
    specValue => specValue.spec,
  )
  @JoinColumn()
  values?: MerchantGoodsSpecValueEntity[] | undefined;
}
