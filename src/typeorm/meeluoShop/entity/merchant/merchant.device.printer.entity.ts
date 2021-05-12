import { Scope, Entity, Column } from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';

export enum MerchantDevicePrinterIsActiveEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum MerchantDevicePrinterBrandEnum {
  YILIANYUN = 10, // 易联云
}

@Scope<MerchantDevicePrinterEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_device_printer', { database: MEELUO_SHOP_DATABASE })
export class MerchantDevicePrinterEntity extends MerchantBaseEntity {
  @Column('varchar', { length: 50, default: '', comment: '打印机名称' })
  name: string;

  @Column('tinyint', {
    comment: '品牌(10易联云)',
    unsigned: true,
    default: MerchantDevicePrinterBrandEnum.YILIANYUN,
  })
  brand: MerchantDevicePrinterBrandEnum;

  @Column('varchar', { length: 50, default: '', comment: '设备云平台唯一编号' })
  code: string;

  @Column('varchar', { length: 50, default: '', comment: '设备编号' })
  key: string;

  @Column('varchar', { length: 50, default: '', comment: '设备密钥' })
  secret: string;

  @Column('varchar', { length: 20, default: '', comment: '流量卡号码' })
  phone: string;

  @Column('int', {
    comment: '自动打印数量',
    unsigned: true,
    nullable: true,
    default: 1,
  })
  printCount: number;

  @Column('tinyint', {
    comment: '是否启用',
    unsigned: true,
    default: MerchantDevicePrinterIsActiveEnum.TRUE,
  })
  isActive: MerchantDevicePrinterIsActiveEnum;
}
