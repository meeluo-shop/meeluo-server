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

export enum MerchantUserPointsModifyTypeEnum {
  ADD = 1, // 增加
  SUBTRACT = 2, // 减少
}

@Scope<MerchantUserPointsLogEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_user_points_log', { database: MEELUO_SHOP_DATABASE })
export class MerchantUserPointsLogEntity extends MerchantBaseEntity {
  @Column('bigint', { unsigned: true, transformer: idTransformer })
  merchantUserId: number;

  @Column('tinyint', {
    comment: '变动类型，1增加 2减少',
    unsigned: true,
    default: MerchantUserPointsModifyTypeEnum.ADD,
  })
  type: MerchantUserPointsModifyTypeEnum;

  @Column({
    type: 'int',
    default: 0,
    unsigned: true,
    comment: '变动数量',
  })
  value: number;

  @Column('varchar', { length: 500, nullable: true, comment: '描述/说明' })
  description: string;

  @Column('varchar', { length: 500, nullable: true, comment: '管理员操作备注' })
  remark: string;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser: MerchantUserEntity;
}
