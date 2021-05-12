import {
  Scope,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from '@jiaxinjiang/nest-orm';
import { MerchantBaseEntity } from './merchant.base.entity';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { idTransformer } from '@typeorm/base.entity';
import { MerchantUserEntity } from './merchant.user.entity';

export enum IsMerchantUserDefaultAddressEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<MerchantUserAddressEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_user_address', { database: MEELUO_SHOP_DATABASE })
export class MerchantUserAddressEntity extends MerchantBaseEntity {
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

  @Column('tinyint', {
    comment: '是否为默认收获地址，1是，0否，默认为0',
    unsigned: true,
    default: IsMerchantUserDefaultAddressEnum.FALSE,
  })
  isDefault: IsMerchantUserDefaultAddressEnum;

  @Column('bigint', { unsigned: true, transformer: idTransformer })
  merchantUserId: number;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser: MerchantUserEntity;
}
