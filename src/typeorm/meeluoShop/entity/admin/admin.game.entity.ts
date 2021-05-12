import {
  Column,
  Entity,
  ManyToOne,
  Scope,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { idTransformer, BaseEntity } from '@typeorm/base.entity';
import { CommonResourceEntity } from '../common/common.resource.entity';
import { AdminGameCategoryEntity } from './admin.game.category.entity';
import { AdminGameDifficultyEntity } from './admin.game.difficulty.entity';
import { MerchantGameEntity } from '../merchant/merchant.game.entity';
import { MerchantGameActivityEntity } from '../merchant/merchant.game.activity.entity';

export enum AdminGameIsWinningEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<AdminGameEntity>([{ column: 'is_delete', value: 0 }])
@Entity('admin_game', { database: MEELUO_SHOP_DATABASE })
export class AdminGameEntity extends BaseEntity {
  static AdminGameImageTable = 'admin_game_image';

  @Column('varchar', { length: 50, comment: '游戏名称' })
  name: string;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    comment: '游戏缩略图',
    transformer: idTransformer,
  })
  thumbnailId: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  categoryId: number;

  @Column('varchar', { length: 1000, comment: '游戏描述' })
  description: string;

  @Column('varchar', { length: 20, comment: '游戏获奖单位，如（分/米/次）' })
  unit: string;

  @Column('text', { nullable: true, comment: '游戏规则介绍' })
  rule: string;

  @Column('tinyint', {
    comment: '是否是赢奖游戏(1是 0否)，默认0',
    unsigned: true,
    default: AdminGameIsWinningEnum.FALSE,
  })
  isWinning: AdminGameIsWinningEnum;

  @Column('int', { comment: '游戏玩的总次数', default: 0 })
  playCount: number;

  @Column('int', { comment: '玩游戏的总人数', default: 0 })
  playPeopleCount: number;

  @Column('int', { comment: '游戏收藏总数', default: 0 })
  collectionCount: number;

  @Column('varchar', { length: 500, nullable: true, comment: 'h5游戏url地址' })
  gameUrl: string;

  @OneToMany(
    () => AdminGameDifficultyEntity,
    difficulty => difficulty.game,
  )
  @JoinColumn()
  difficulty?: AdminGameDifficultyEntity[] | undefined;

  @ManyToMany(() => CommonResourceEntity)
  @JoinTable({ name: AdminGameEntity.AdminGameImageTable })
  images?: CommonResourceEntity[] | undefined;

  @ManyToOne(() => AdminGameCategoryEntity)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category?: AdminGameCategoryEntity | undefined;

  @ManyToOne(() => CommonResourceEntity)
  @JoinColumn({ name: 'thumbnail_id', referencedColumnName: 'id' })
  thumbnail?: CommonResourceEntity | undefined;

  merchantGame?: MerchantGameEntity;

  activityGame?: MerchantGameActivityEntity;
}
