import { Column, ManyToOne, JoinColumn } from '@jiaxinjiang/nest-orm';
import { BaseEntity, idTransformer } from '@typeorm/base.entity';
import { MerchantEntity } from './merchant.entity';

export abstract class MerchantBaseEntity extends BaseEntity {
  @Column('bigint', {
    unsigned: true,
    transformer: idTransformer,
    comment: '商户id',
  })
  merchantId: number;

  @ManyToOne(() => MerchantEntity)
  @JoinColumn({ name: 'merchant_id', referencedColumnName: 'id' })
  merchant: MerchantEntity;
}
