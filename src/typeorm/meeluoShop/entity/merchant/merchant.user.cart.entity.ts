import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Scope,
} from '@jiaxinjiang/nest-orm';
import { idTransformer } from '@typeorm/base.entity';
import { MerchantBaseEntity } from './merchant.base.entity';
import { MerchantGoodsEntity } from './merchant.goods.entity';
import { MerchantUserEntity } from './merchant.user.entity';

@Scope<MerchantUserCartEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_user_cart', { database: MEELUO_SHOP_DATABASE })
export class MerchantUserCartEntity extends MerchantBaseEntity {
  @Column('bigint', { unsigned: true, transformer: idTransformer })
  merchantUserId: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  goodsId: number;

  @Column('int', {
    comment: '商品数量',
    unsigned: true,
    nullable: true,
    default: 1,
  })
  goodsNum: number;

  @Column('varchar', {
    length: 255,
    nullable: true,
    comment: '商品sku记录索引 (由规格id组成)',
  })
  specSkuId: string;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser: MerchantUserEntity;

  @ManyToOne(() => MerchantGoodsEntity)
  @JoinColumn({ name: 'goods_id', referencedColumnName: 'id' })
  goods?: MerchantGoodsEntity | undefined;
}
