import { Scope, Entity, Column } from '@jiaxinjiang/nest-orm';
import { MerchantBaseEntity } from './merchant.base.entity';
import { MEELUO_SHOP_DATABASE } from '@core/constant';

export enum IsMerchantUserDefaultGradeEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<MerchantUserGradeEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_user_grade', { database: MEELUO_SHOP_DATABASE })
export class MerchantUserGradeEntity extends MerchantBaseEntity {
  @Column('varchar', { comment: '用户等级名称', length: 50 })
  name: string;

  @Column('int', { comment: '用户等级权重', unsigned: true, default: 0 })
  weight: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '升级需要的金额，用户的实际消费金额满n元后，自动升级',
    default: 0,
    unsigned: true,
  })
  upgrade: number;

  @Column('tinyint', {
    comment: '等级权益(折扣率0-100)',
    default: 100,
    unsigned: true,
  })
  equity: number;

  @Column('tinyint', {
    comment: '是否为默认等级，1是，0否，默认为0',
    unsigned: true,
    default: IsMerchantUserDefaultGradeEnum.FALSE,
  })
  isDefault: IsMerchantUserDefaultGradeEnum;
}
