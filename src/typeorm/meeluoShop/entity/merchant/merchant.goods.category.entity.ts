import {
  Column,
  Entity,
  ManyToOne,
  Scope,
  JoinColumn,
  OneToMany,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';
import { idTransformer } from '@typeorm/base.entity';
import { CommonResourceEntity } from '../common/common.resource.entity';
import { MerchantGoodsEntity } from './merchant.goods.entity';

export enum MerchantGoodsTypeEnum {
  GOODS = 10,
  FOODS = 20,
}

@Scope<MerchantGoodsCategoryEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_goods_category', { database: MEELUO_SHOP_DATABASE })
export class MerchantGoodsCategoryEntity extends MerchantBaseEntity {
  @Column('varchar', { length: 50, comment: '分类名称' })
  name: string;

  @Column('int', {
    comment: '分类顺序',
    unsigned: true,
    nullable: true,
    default: 100,
  })
  order: number;

  @Column('tinyint', {
    comment: '商品分类类型，10 商品 20 菜品，默认10',
    unsigned: true,
    default: MerchantGoodsTypeEnum.GOODS,
  })
  type: MerchantGoodsTypeEnum;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  imageId: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  superiorId: number;

  @OneToMany(
    () => MerchantGoodsEntity,
    goods => goods.category,
  )
  @JoinColumn()
  goods?: MerchantGoodsEntity[] | undefined;

  @ManyToOne(() => CommonResourceEntity)
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image?: CommonResourceEntity | undefined;

  @ManyToOne(
    () => MerchantGoodsCategoryEntity,
    category => category.superior,
  )
  superior?: MerchantGoodsCategoryEntity | undefined;
}
