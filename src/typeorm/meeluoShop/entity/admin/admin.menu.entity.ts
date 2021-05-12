import { Column, Entity, ManyToOne, Scope } from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { BaseEntity, idTransformer } from '@typeorm/base.entity';

export enum AdminIsMenuCategoryEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<AdminMenuEntity>([{ column: 'is_delete', value: 0 }])
@Entity('admin_menu', { database: MEELUO_SHOP_DATABASE })
export class AdminMenuEntity extends BaseEntity {
  @Column('varchar', { length: 50, comment: '菜单名称' })
  name: string;

  @Column('varchar', { length: 50, comment: '菜单编号' })
  code: string;

  @Column('varchar', { length: 200, nullable: true, comment: '菜单地址' })
  path: string;

  @Column('varchar', { length: 200, nullable: true, comment: '重定向地址' })
  redirect: string;

  @Column('varchar', { length: 100, comment: '图标地址', nullable: true })
  icon: string;

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
    default: AdminIsMenuCategoryEnum.FALSE,
  })
  isCategory: AdminIsMenuCategoryEnum;

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
    () => AdminMenuEntity,
    menu => menu.category,
  )
  category?: AdminMenuEntity | undefined;

  @ManyToOne(
    () => AdminMenuEntity,
    menu => menu.superior,
  )
  superior?: AdminMenuEntity | undefined;
}
