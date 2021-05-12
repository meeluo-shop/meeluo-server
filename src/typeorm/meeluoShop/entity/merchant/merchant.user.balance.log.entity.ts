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

export enum MerchantUserBalanceLogSceneEnum {
  USER_RECHARGE = 10, // 用户充值
  USER_CONSUME = 20, // 用户消费
  ADMIN_OPERATION = 30, // 管理员操作
  ORDER_REFUND = 40, // 用户退款
  USER_RECHARGE_GIFT = 50, // 用户充值套餐赠送
  QRCODE_CONSUME = 60, // 商家扫码扣款
}

export enum MerchantUserBalanceModifyTypeEnum {
  ADD = 1, // 增加
  SUBTRACT = 2, // 减少
}

@Scope<MerchantUserBalanceLogEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_user_balance_log', { database: MEELUO_SHOP_DATABASE })
export class MerchantUserBalanceLogEntity extends MerchantBaseEntity {
  @Column('bigint', { unsigned: true, transformer: idTransformer })
  merchantUserId: number;

  @Column('tinyint', {
    comment: '余额变动场景(10用户充值 20用户消费 30管理员操作 40订单退款)',
    unsigned: true,
    default: MerchantUserBalanceLogSceneEnum.USER_RECHARGE,
  })
  scene: MerchantUserBalanceLogSceneEnum;

  @Column('tinyint', {
    comment: '变动类型，1增加 2减少',
    unsigned: true,
    default: MerchantUserBalanceModifyTypeEnum.ADD,
  })
  type: MerchantUserBalanceModifyTypeEnum;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    unsigned: true,
    comment: '变动金额',
  })
  money: number;

  @Column('varchar', { length: 500, nullable: true, comment: '描述/说明' })
  description: string;

  @Column('varchar', { length: 500, nullable: true, comment: '管理员操作备注' })
  remark: string;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser: MerchantUserEntity;
}
