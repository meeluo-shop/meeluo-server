import {
  Scope,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';
import { idTransformer } from '@typeorm/base.entity';
import { AdminGameEntity } from '../admin/admin.game.entity';
import { MerchantGamePrizeEntity } from './merchant.game.prize.entity';

@Scope<MerchantGameActivityEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_game_activity', { database: MEELUO_SHOP_DATABASE })
export class MerchantGameActivityEntity extends MerchantBaseEntity {
  @Column('bigint', {
    unsigned: true,
    transformer: idTransformer,
  })
  adminGameId: number;

  @Column('int', { comment: '免费试玩次数', default: 0 })
  freeNum: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '玩游戏价格（非现实金额）',
    default: 0,
  })
  playPrice: number;

  @Column('int', { comment: '分享朋友圈后可获得的免费次数', default: 0 })
  sharedFreeNum: number;

  @Column('int', { comment: '邀请好友参与游戏可获得的奖励次数', default: 0 })
  invitedFreeNum: number;

  @Column('int', { comment: '关注公众号后可获得的免费次数', default: 0 })
  followFreeNum: number;

  @Column('int', {
    comment: '邀请好友参与每天可获得奖励的最多人数',
    default: 0,
  })
  maxInvitedNum: number;

  @ManyToOne(() => AdminGameEntity)
  @JoinColumn({ name: 'admin_game_id', referencedColumnName: 'id' })
  adminGame: AdminGameEntity;

  @OneToMany(
    () => MerchantGamePrizeEntity,
    prize => prize.gameActivity,
  )
  @JoinColumn()
  gamePrizeList?: MerchantGamePrizeEntity[] | undefined;
}
