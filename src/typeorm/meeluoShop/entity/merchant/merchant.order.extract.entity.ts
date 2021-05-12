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
import { MerchantOrderEntity } from './merchant.order.entity';
import { MerchantUserEntity } from './merchant.user.entity';

@Scope<MerchantOrderExtractEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_order_extract', { database: MEELUO_SHOP_DATABASE })
export class MerchantOrderExtractEntity extends MerchantBaseEntity {
  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  orderId?: number;

  @Column('varchar', { comment: '自提联系人姓名', length: 50, nullable: true })
  linkman: string;

  @Column('varchar', { comment: '自提联系人电话', length: 50, nullable: true })
  phone: string;

  @Column('bigint', { unsigned: true, transformer: idTransformer })
  merchantUserId: number;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser: MerchantUserEntity;

  @ManyToOne(() => MerchantOrderEntity)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order?: MerchantOrderEntity;
}
