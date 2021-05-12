import {
  Scope,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';
import { idTransformer } from '@typeorm/base.entity';
import { MerchantDeliveryEntity } from './merchant.delivery.entity';

@Scope<MerchantDeliveryRuleEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_delivery_rule', { database: MEELUO_SHOP_DATABASE })
export class MerchantDeliveryRuleEntity extends MerchantBaseEntity {
  @Column('text', { comment: '可配送区域(城市id集)' })
  regions: string;

  @Column('double', { default: 0, comment: '首件(个)/首重(Kg)' })
  first: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '运费(元)',
    default: 0,
  })
  firstFee: number;

  @Column('double', { default: 0, comment: '续件/续重' })
  additional: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '续费(元)',
    default: 0,
  })
  additionalFee: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  deliveryId: number;

  @ManyToOne(() => MerchantDeliveryEntity)
  @JoinColumn({ name: 'delivery_id', referencedColumnName: 'id' })
  delivery?: MerchantDeliveryEntity | undefined;
}
