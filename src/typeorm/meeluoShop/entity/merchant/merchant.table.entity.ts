import { Scope, Entity, Column } from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';

export enum MerchantTableStatusEnum {
  NO_BUSY = 10,
  BUSY = 20,
}

@Scope<MerchantTableEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_table', { database: MEELUO_SHOP_DATABASE })
export class MerchantTableEntity extends MerchantBaseEntity {
  @Column('varchar', { length: 50, comment: '餐桌名称' })
  name: string;

  @Column('int', {
    comment: '容纳人数',
    unsigned: true,
    nullable: true,
    default: 0,
  })
  people: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '最低消费',
    default: 0,
    unsigned: true,
  })
  minConsumeFee: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '餐具调料费/人',
    default: 0,
    unsigned: true,
  })
  wareFee: number;

  @Column('varchar', {
    length: 200,
    nullable: true,
    comment: '获取的二维码ticket，凭借此ticket可以在有效时间内换取二维码',
  })
  qrcodeTicket: string;

  @Column('tinyint', {
    comment: '状态 (10闲 20忙)，默认10',
    unsigned: true,
    default: MerchantTableStatusEnum.NO_BUSY,
  })
  status: MerchantTableStatusEnum;

  @Column('int', {
    comment: '餐桌顺序',
    unsigned: true,
    nullable: true,
    default: 100,
  })
  order: number;
}
