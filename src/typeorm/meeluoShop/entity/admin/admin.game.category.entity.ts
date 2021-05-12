import {
  Column,
  Entity,
  ManyToOne,
  Scope,
  JoinColumn,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { idTransformer, BaseEntity } from '@typeorm/base.entity';
import { CommonResourceEntity } from '../common/common.resource.entity';

@Scope<AdminGameCategoryEntity>([{ column: 'is_delete', value: 0 }])
@Entity('admin_game_category', { database: MEELUO_SHOP_DATABASE })
export class AdminGameCategoryEntity extends BaseEntity {
  @Column('varchar', { length: 50, comment: '分类名称' })
  name: string;

  @Column('int', {
    comment: '分类顺序',
    unsigned: true,
    nullable: true,
    default: 100,
  })
  order: number;

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

  @ManyToOne(() => CommonResourceEntity)
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image?: CommonResourceEntity | undefined;

  @ManyToOne(
    () => AdminGameCategoryEntity,
    category => category.superior,
  )
  superior?: AdminGameCategoryEntity | undefined;
}
