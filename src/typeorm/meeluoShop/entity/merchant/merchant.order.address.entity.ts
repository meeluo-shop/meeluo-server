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

@Scope<MerchantOrderAddressEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_order_address', { database: MEELUO_SHOP_DATABASE })
export class MerchantOrderAddressEntity extends MerchantBaseEntity {
  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  orderId?: number;

  @Column('varchar', { comment: '收货人姓名', length: 50, nullable: true })
  name: string;

  @Column('varchar', { comment: '收货人手机号', length: 50, nullable: true })
  phone: string;

  @Column('int', { comment: '省份编号', unsigned: true, nullable: true })
  provinceCode: number;

  @Column('int', { comment: '城市编号', unsigned: true, nullable: true })
  cityCode: number;

  @Column('int', { comment: '县市区编号', unsigned: true, nullable: true })
  countyCode: number;

  @Column('varchar', {
    comment: '详细地址',
    length: 500,
    nullable: true,
  })
  address: string;

  provinceName?: string;

  cityName?: string;

  countyName?: string;

  @Column('bigint', { unsigned: true, transformer: idTransformer })
  merchantUserId: number;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser: MerchantUserEntity;

  @ManyToOne(() => MerchantOrderEntity)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order?: MerchantOrderEntity;
}
