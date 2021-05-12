import { Scope, Entity, Column } from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';

@Scope<MerchantAddressEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_address', { database: MEELUO_SHOP_DATABASE })
export class MerchantAddressEntity extends MerchantBaseEntity {
  @Column('varchar', { length: 50, comment: '收货人姓名' })
  name: string;

  @Column('varchar', { length: 50, comment: '收货人电话' })
  phone: string;

  @Column('varchar', { length: 255, comment: '详细地址' })
  detail: string;
}
