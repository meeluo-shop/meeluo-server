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
import { AdminGameEntity } from '../admin/admin.game.entity';

export enum MerchantGameIsActiveEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<MerchantGameEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_game', { database: MEELUO_SHOP_DATABASE })
export class MerchantGameEntity extends MerchantBaseEntity {
  @Column('bigint', {
    comment: '系统游戏id',
    unsigned: true,
    transformer: idTransformer,
  })
  adminGameId = 0;

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

  @Column('text', { nullable: true, comment: '游戏规则（商家自定义）' })
  rule: string;

  @Column('int', { comment: '游戏玩的总次数', default: 0 })
  playCount = 0;

  @Column('int', { comment: '玩游戏的总人数', default: 0 })
  playPeopleCount = 0;

  @Column('int', { comment: '游戏收藏总数', default: 0 })
  collectionCount = 0;

  @Column('varchar', {
    length: 200,
    nullable: true,
    comment: '获取的二维码ticket，凭借此ticket可以在有效时间内换取二维码',
  })
  qrcodeTicket: string;

  @Column('tinyint', {
    comment: '是否启用，默认1',
    unsigned: true,
    default: MerchantGameIsActiveEnum.TRUE,
  })
  isActive: MerchantGameIsActiveEnum = MerchantGameIsActiveEnum.TRUE;

  @ManyToOne(() => AdminGameEntity)
  @JoinColumn({ name: 'admin_game_id', referencedColumnName: 'id' })
  adminGame: AdminGameEntity;
}
