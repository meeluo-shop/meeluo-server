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
} from '../admin/admin.game.entity';
import { MerchantGameEntity } from './merchant.game.entity';

export enum MerchantGameInviteStatusEnum {
  SUCCESS = 1,
  FAIL = 0,
}

export enum MerchantGameInviteIsNewUserEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<MerchantGameInviteEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_game_invite', { database: MEELUO_SHOP_DATABASE })
export class MerchantGameInviteEntity extends MerchantBaseEntity {
  @Column('bigint', {
    comment: '系统游戏id',
    unsigned: true,
    transformer: idTransformer,
  })
  adminGameId: number;

  @Column('bigint', {
    comment: '邀请人用户id',
    unsigned: true,
    transformer: idTransformer,
  })
  inviteUserId: number;

  @Column('bigint', {
    comment: '被邀请用户id',
    unsigned: true,
    transformer: idTransformer,
  })
  merchantUserId: number;

  @Column('int', {
    comment: '邀请日期，如：20210305',
    unsigned: true,
    nullable: true,
    default: 0,
  })
  inviteDate: number;

  @Column('tinyint', {
    comment: '邀请用户是否成功获得奖励(1是 0否)，默认1',
    unsigned: true,
    default: MerchantGameInviteStatusEnum.SUCCESS,
  })
  status: MerchantGameInviteStatusEnum;

  @Column('tinyint', {
    comment: '被邀请的是否是新用户(1是 0否)，默认0',
    unsigned: true,
    default: MerchantGameInviteIsNewUserEnum.FALSE,
  })
  isNewUser: MerchantGameInviteIsNewUserEnum;

  @ManyToOne(() => AdminGameEntity)
  @JoinColumn({ name: 'admin_game_id', referencedColumnName: 'id' })
  adminGame: AdminGameEntity;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser: MerchantUserEntity;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'invite_user_id', referencedColumnName: 'id' })
  inviteUser: MerchantUserEntity;

  merchantGame: MerchantGameEntity;
}
