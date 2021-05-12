import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantBaseEntity } from './merchant.base.entity';
import { Scope, Entity, Column } from '@jiaxinjiang/nest-orm';

export enum MerchantPageTypeEnum {
  NO_TYPE = 0, // 无类型页面
  INDEX = 10, // 首页
  SHOP = 20, // 商城页面
  GAME = 30, // 游戏页面
  RESTAURANT = 40, // 餐厅页面
}

@Scope<MerchantPageEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_page', { database: MEELUO_SHOP_DATABASE })
export class MerchantPageEntity extends MerchantBaseEntity {
  @Column('varchar', { length: 255, comment: '页面名称' })
  name: string;

  @Column('tinyint', {
    comment:
      '页面类型，0未使用页面，10首页，20商城页面，30游戏页面，40餐厅页面，默认0',
    unsigned: true,
    default: MerchantPageTypeEnum.NO_TYPE,
  })
  type: MerchantPageTypeEnum;

  @Column('int', {
    comment: '页面顺序',
    unsigned: true,
    nullable: true,
    default: 0,
  })
  order: number;

  // 自定义页面的内容参数
  data: string;
}
