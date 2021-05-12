import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Scope,
} from '@jiaxinjiang/nest-orm';
import { idTransformer } from '@typeorm/base.entity';
import { AdminGameEntity } from '../admin';
import { MerchantBaseEntity } from './merchant.base.entity';
import { MerchantGameRankingEntity } from './merchant.game.ranking.entity';
import { MerchantUserEntity } from './merchant.user.entity';

export enum MerchantGameOrderPayTypeEnum {
  NULL = 0,
  WECHAT = 10,
  BALANCE = 20,
}

@Scope<MerchantGameOrderEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_game_order', { database: MEELUO_SHOP_DATABASE })
export class MerchantGameOrderEntity extends MerchantBaseEntity {
  @Column('bigint', {
    comment: '游戏id',
    unsigned: true,
    transformer: idTransformer,
  })
  adminGameId: number;

  @Column('bigint', {
    comment: '游戏挑战记录id',
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  gameRankingId?: number;

  @Column('bigint', {
    comment: '微信支付订单id',
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  wechatPaymentOrderId?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '订单金额（元）',
    default: 0,
    unsigned: true,
  })
  price: number;

  @Column('tinyint', {
    comment: '支付方式(0未支付 10微信支付 20余额支付)，默认0',
    unsigned: true,
    default: MerchantGameOrderPayTypeEnum.NULL,
  })
  payType: MerchantGameOrderPayTypeEnum;

  @Column('bigint', {
    comment: '用户id',
    unsigned: true,
    transformer: idTransformer,
  })
  merchantUserId: number;

  @OneToOne(() => MerchantGameRankingEntity)
  @JoinColumn({ name: 'game_ranking_id', referencedColumnName: 'id' })
  gameRanking?: MerchantGameRankingEntity | undefined;

  @ManyToOne(() => AdminGameEntity)
  @JoinColumn({ name: 'admin_game_id', referencedColumnName: 'id' })
  adminGame?: AdminGameEntity | undefined;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser?: MerchantUserEntity;
}
