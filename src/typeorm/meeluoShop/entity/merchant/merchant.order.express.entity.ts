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
import { MerchantOrderEntity } from './merchant.order.entity';
import { MerchantOrderGoodsEntity } from './merchant.order.goods.entity';
import { MerchantUserEntity } from './merchant.user.entity';

@Entity('merchant_order_express', { database: MEELUO_SHOP_DATABASE })
export class MerchantOrderExpressEntity extends MerchantBaseEntity {
  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  orderId: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  orderGoodsId: number;

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

  @OneToOne(() => MerchantOrderGoodsEntity)
  @JoinColumn({ name: 'order_goods_id', referencedColumnName: 'id' })
  orderGoods?: MerchantOrderGoodsEntity;

  @ManyToOne(() => AdminExpressEntity)
  @JoinColumn({ name: 'express_id', referencedColumnName: 'id' })
  express?: AdminExpressEntity;

  @ManyToOne(() => MerchantOrderEntity)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order?: MerchantOrderEntity;

  @ManyToOne(() => MerchantUserEntity)
  @JoinColumn({ name: 'merchant_user_id', referencedColumnName: 'id' })
  merchantUser?: MerchantUserEntity;
}
