import { Column, Scope, Entity } from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';

@Scope<MerchantRechargePlanEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_recharge_plan', { database: MEELUO_SHOP_DATABASE })
export class MerchantRechargePlanEntity extends MerchantBaseEntity {
  @Column('varchar', { length: 100, comment: '充值套餐名称' })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '充值金额',
    default: 0,
    unsigned: true,
  })
  rechargeAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '赠送金额',
    default: 0,
    unsigned: true,
  })
  donationAmount: number;

  @Column('int', {
    comment: '套餐顺序',
    unsigned: true,
    nullable: true,
    default: 100,
  })
  order: number;
}
