import { Column, Entity, ManyToOne, Scope } from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { idTransformer } from '@typeorm/base.entity';
import { MerchantBaseEntity } from './merchant.base.entity';

export enum MerchantStaffIsMenuCategoryEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<MerchantStaffMenuEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant_staff_menu', { database: MEELUO_SHOP_DATABASE })
export class MerchantStaffMenuEntity extends MerchantBaseEntity {
  @Column('varchar', { length: 50, comment: '菜单名称' })
  name: string;

  @Column('varchar', { length: 50, comment: '菜单编号' })
  code: string;

  @Column('varchar', { length: 200, comment: '菜单地址' })
  path: string;

  @Column('varchar', { length: 100, comment: '图标地址', nullable: true })
  icon: string;

  @Column('varchar', { length: 1024, comment: '扩展属性', nullable: true })
  extraAttr: string;

  @Column('int', {
    comment: '菜单顺序',
    unsigned: true,
    nullable: true,
    default: 100,
  })
  order: number;

  @Column('varchar', { length: 255, comment: '备注', nullable: true })
  remark: string;

  @Column('tinyint', {
    comment: '是否是分类，用来跟菜单分组用',
    unsigned: true,
    default: MerchantStaffIsMenuCategoryEnum.FALSE,
  })
  isCategory: MerchantStaffIsMenuCategoryEnum;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  categoryId: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  superiorId: number;

  @ManyToOne(
    () => MerchantStaffMenuEntity,
    menu => menu.category,
  )
  category?: MerchantStaffMenuEntity | undefined;

  @ManyToOne(
    () => MerchantStaffMenuEntity,
    menu => menu.superior,
  )
  superior?: MerchantStaffMenuEntity | undefined;
}
