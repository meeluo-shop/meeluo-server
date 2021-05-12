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
import { AdminGameEntity } from '../admin';
import { MerchantGameActivityEntity } from './merchant.game.activity.entity';
import { MerchantGoodsEntity } from './merchant.goods.entity';
import { MerchantGoodsTypeEnum } from './merchant.goods.category.entity';

@Scope<MerchantGamePrizeEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_game_prize', { database: MEELUO_SHOP_DATABASE })
export class MerchantGamePrizeEntity extends MerchantBaseEntity {
  @Column('bigint', {
    unsigned: true,
    transformer: idTransformer,
  })
  gameActivityId: number;

  @Column('bigint', {
    unsigned: true,
    transformer: idTransformer,
  })
  adminGameId: number;

  @Column('tinyint', {
    comment: '奖品类型，10商品，20菜品，默认10',
    unsigned: true,
    default: MerchantGoodsTypeEnum.GOODS,
  })
  type: MerchantGoodsTypeEnum;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  goodsId: number;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 4,
    comment: '达成分数',
    default: 0,
  })
  score: number;

  @ManyToOne(() => MerchantGameActivityEntity)
  @JoinColumn({ name: 'game_activity_id', referencedColumnName: 'id' })
  gameActivity?: MerchantGameActivityEntity | undefined;

  @ManyToOne(() => AdminGameEntity)
  @JoinColumn({ name: 'admin_game_id', referencedColumnName: 'id' })
  adminGame?: AdminGameEntity | undefined;

  @ManyToOne(() => MerchantGoodsEntity)
  @JoinColumn({ name: 'goods_id', referencedColumnName: 'id' })
  goods?: MerchantGoodsEntity | undefined;
}
