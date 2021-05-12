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
import { MerchantGameRankingEntity } from './merchant.game.ranking.entity';
import { MerchantGameWinningGoodsEntity } from './merchant.game.winning.goods.entity';
import { MerchantGameWinningAddressEntity } from './merchant.game.winning.address.entity';
import { MerchantStaffEntity } from './merchant.staff.entity';
import { MerchantUserEntity } from './merchant.user.entity';
import { MerchantGoodsTypeEnum } from './merchant.goods.category.entity';

export enum MerchantGameWinningStatusEnum {
  NO_RECEIVED = 10, // 待领取
  NO_DELIVERED = 20, // 待发货
  DELIVERED = 30, // 已发货
  RECEIVED = 40, // 已领取
  EXPIRED = 99, // 已过期
}

@Scope<MerchantGameWinningEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_game_winning', { database: MEELUO_SHOP_DATABASE })
export class MerchantGameWinningEntity extends MerchantBaseEntity {
  @Column('varchar', { length: 20, comment: '奖品订单号' })
  winningNo: string;

  @Column('bigint', {
    comment: '系统游戏id',
    unsigned: true,
    transformer: idTransformer,
  })
  adminGameId = 0;

  @Column('bigint', {
    comment: '游戏挑战记录id',
    unsigned: true,
    transformer: idTransformer,
  })
  gameRankingId: number;

  @Column('bigint', {
    comment: '用户id',
    unsigned: true,
    transformer: idTransformer,
  })
  merchantUserId: number;

  @Column('bigint', {
    comment: '奖品核销人员id',
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  extractClerkId: number;

  @Column('tinyint', {
    comment: '奖品类型，10商品，20菜品',
    unsigned: true,
  })
  prizeType: MerchantGoodsTypeEnum;

  @Column('tinyint', {
    comment: '是否领取，10待领取，20待发货，30已发货，40已领取。默认10',
    unsigned: true,
    default: MerchantGameWinningStatusEnum.NO_RECEIVED,
  })
  status: MerchantGameWinningStatusEnum;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser: MerchantUserEntity;

  @ManyToOne(() => MerchantGameRankingEntity)
  @JoinColumn({ name: 'game_ranking_id', referencedColumnName: 'id' })
  gameRanking?: MerchantGameRankingEntity;

  @ManyToOne(() => MerchantStaffEntity)
  @JoinColumn({ name: 'extract_clerk_id', referencedColumnName: 'id' })
  extractClerk?: MerchantStaffEntity;

  winningGoods?: MerchantGameWinningGoodsEntity;

  winningAddress?: MerchantGameWinningAddressEntity;
}
