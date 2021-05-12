import { Column, Entity, ManyToOne, Scope } from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { BaseEntity, idTransformer } from '@typeorm/base.entity';

export enum AdminIsPermCategoryEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum AdminIsSystemPermEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<AdminPermEntity>([{ column: 'is_delete', value: 0 }])
@Entity('admin_permission', { database: MEELUO_SHOP_DATABASE })
export class AdminPermEntity extends BaseEntity {
  @Column('varchar', { length: 50, comment: '权限名称' })
  name: string;

  @Column('varchar', { length: 50, comment: '权限编号' })
  code: string;

  @Column('tinyint', {
    comment: '是否是分类，用来跟权限分组用',
    unsigned: true,
    default: AdminIsPermCategoryEnum.FALSE,
  })
  isCategory: AdminIsPermCategoryEnum;

  @Column('tinyint', {
    comment: '是否是系统内置，系统内置的权限无法修改和删除',
    unsigned: true,
    default: AdminIsSystemPermEnum.FALSE,
  })
  systemPerm: AdminIsSystemPermEnum;

  @Column('varchar', { length: 255, comment: '备注', nullable: true })
  remark: string;

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
    () => AdminPermEntity,
    perm => perm.category,
  )
  category?: AdminPermEntity | undefined;

  @ManyToOne(
    () => AdminPermEntity,
    perm => perm.superior,
  )
  superior?: AdminPermEntity | undefined;
}
