import {
  Column,
  Entity,
  ManyToOne,
  Scope,
  JoinColumn,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { idTransformer, BaseEntity } from '@typeorm/base.entity';
import { AdminGameEntity } from './admin.game.entity';

@Scope<AdminGameDifficultyEntity>([{ column: 'is_delete', value: 0 }])
@Entity('admin_game_difficulty', { database: MEELUO_SHOP_DATABASE })
export class AdminGameDifficultyEntity extends BaseEntity {
  @Column('varchar', {
    length: 50,
    comment: '游戏难度名称，如：（普通人级别、大神级别）',
  })
  name: string;

  @Column('varchar', { length: 1000, nullable: true, comment: '游戏难度描述' })
  remark: string;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 4,
    comment: '分数范围（低）',
    default: 0,
  })
  minScore: number;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 4,
    comment: '分数范围（高）',
    default: 0,
  })
  maxScore: number;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  gameId: number;

  @ManyToOne(() => AdminGameEntity)
  @JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
  game?: AdminGameEntity | undefined;
}
