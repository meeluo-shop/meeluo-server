import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from '@jiaxinjiang/nest-orm';
import { idTransformer } from '@typeorm/base.entity';
import { AdminExpressEntity } from '../admin/admin.express.entity';
import { MerchantBaseEntity } from './merchant.base.entity';
import { MerchantGameWinningEntity } from './merchant.game.winning.entity';
import { MerchantGameWinningGoodsEntity } from './merchant.game.winning.goods.entity';
import { MerchantUserEntity } from './merchant.user.entity';

@Entity('merchant_game_winning_express', { database: MEELUO_SHOP_DATABASE })
export class MerchantGameWinningExpressEntity extends MerchantBaseEntity {
  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  winningId: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  winningGoodsId: number;

  @Column('bigint', {
    comment: '物流公司id',
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  expressId: number;

  @Column('varchar', { length: 20, nullable: true, comment: '物流公司名称' })
  expressCompany: string;

  @Column('varchar', { length: 50, nullable: true, comment: '物流单号' })
  expressNo: string;

  @Column('varchar', { length: 255, comment: '物流公司代码' })
  expressCode: string;

  @Column('bigint', {
    comment: '用户id',
    unsigned: true,
    transformer: idTransformer,
  })
  merchantUserId: number;

  @OneToOne(() => MerchantGameWinningGoodsEntity)
  @JoinColumn({ name: 'winning_goods_id', referencedColumnName: 'id' })
  winningGoods?: MerchantGameWinningGoodsEntity;

  @ManyToOne(() => AdminExpressEntity)
  @JoinColumn({ name: 'express_id', referencedColumnName: 'id' })
  express?: AdminExpressEntity;

  @ManyToOne(() => MerchantGameWinningEntity)
  @JoinColumn({ name: 'winning_id', referencedColumnName: 'id' })
  winning?: MerchantGameWinningEntity;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser?: MerchantUserEntity;
}
