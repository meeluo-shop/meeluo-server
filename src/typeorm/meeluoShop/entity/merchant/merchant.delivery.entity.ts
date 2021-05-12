import {
  Scope,
  Entity,
  Column,
  OneToMany,
  JoinColumn,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';
import { MerchantDeliveryRuleEntity } from './merchant.delivery.rule.entity';

export enum MerchantDeliveryMethodEnum {
  PIECE = 10, // 按件计费
  WEIGHT = 20, // 按重量计费
}

@Scope<MerchantDeliveryEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_delivery', { database: MEELUO_SHOP_DATABASE })
export class MerchantDeliveryEntity extends MerchantBaseEntity {
  @Column('varchar', { length: 255, comment: '配送模板名称' })
  name: string;

  @Column('tinyint', {
    comment: '计费方式(10按件数 20按重量)，默认10',
    unsigned: true,
    default: MerchantDeliveryMethodEnum.PIECE,
  })
  method: MerchantDeliveryMethodEnum;

  @Column('int', {
    comment: '排序',
    unsigned: true,
    nullable: true,
    default: 100,
  })
  order: number;

  @OneToMany(
    () => MerchantDeliveryRuleEntity,
    rule => rule.delivery,
  )
  @JoinColumn()
  rules?: MerchantDeliveryRuleEntity[] | undefined;
}
