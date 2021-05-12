import {
  Scope,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';
import { idTransformer } from '@typeorm/base.entity';
import { MerchantUserEntity } from './merchant.user.entity';
import {
  AdminGameEntity,
  AdminGameIsWinningEnum,
} from '../admin/admin.game.entity';
import { WechatUserEntity } from '../wechat';

export enum MerchantGameRankingIsMaxEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<MerchantGameRankingEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_game_ranking', { database: MEELUO_SHOP_DATABASE })
export class MerchantGameRankingEntity extends MerchantBaseEntity {
  @Column('bigint', {
    comment: '系统游戏id',
    unsigned: true,
    transformer: idTransformer,
  })
  adminGameId: number;

  @Column('varchar', {
    comment: '微信公众号openid',
    length: 50,
    nullable: true,
  })
  openid: string;

  @Column('varchar', {
    length: 50,
    nullable: true,
    comment: '游戏名称（商家自定义）',
  })
  name: string;

  @Column('varchar', {
    length: 1000,
    nullable: true,
    comment: '游戏描述（商家自定义）',
  })
  description: string;

  @Column('varchar', { length: 500, nullable: true, comment: '游戏缩略图' })
  thumbnailUrl: string;

  @Column('varchar', { length: 20, comment: '游戏获奖单位，如（分/米/次）' })
  unit: string;

  @Column('tinyint', {
    comment: '是否是赢奖游戏(1是 0否)，默认0',
    unsigned: true,
    default: AdminGameIsWinningEnum.FALSE,
  })
  isWinning: AdminGameIsWinningEnum;

  @Column('bigint', {
    comment: '游戏分数',
    unsigned: true,
    nullable: true,
    default: 0,
  })
  score: number;

  @Column('tinyint', {
    comment: '是否是当前商户用户最高记录(1是 0否)，默认0',
    unsigned: true,
    default: MerchantGameRankingIsMaxEnum.FALSE,
  })
  isMax: MerchantGameRankingIsMaxEnum;

  @Column('varchar', {
    length: 200,
    nullable: true,
    comment: '用户留言',
  })
  leaveWord: string;

  @Column('bigint', {
    comment: '用户id',
    unsigned: true,
    transformer: idTransformer,
  })
  merchantUserId: number;

  @ManyToOne(() => AdminGameEntity)
  @JoinColumn({ name: 'admin_game_id', referencedColumnName: 'id' })
  adminGame: AdminGameEntity;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser: MerchantUserEntity;

  @ManyToOne(() => WechatUserEntity)
  @JoinColumn({ name: 'openid', referencedColumnName: 'openid' })
  wechatUser: WechatUserEntity;
}
