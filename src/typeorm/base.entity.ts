import * as UUID from 'uuid-int';
import {
  Column,
  IdColumn,
  BeforeInsert,
  PrimaryColumn,
  CreateDateColumn,
  CreateUserColumn,
  UpdateUserColumn,
  UpdateDateColumn,
  VersionColumn,
  SoftDeleteColumn,
} from '@jiaxinjiang/nest-orm';

const generator = UUID(100);

export const idTransformer = {
  to: val => val,
  from: val => (val !== null ? Number(val) : val),
};

export enum IsDeleteEnum {
  TRUE = 1,
  FALSE = 0,
}

export abstract class BaseEntity {
  @IdColumn()
  @PrimaryColumn({ type: 'bigint', unsigned: true, transformer: idTransformer })
  id?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @CreateUserColumn()
  @Column({ type: 'bigint', unsigned: true, transformer: idTransformer })
  createdById?: number;

  @UpdateDateColumn()
  updatedAt?: Date;

  @UpdateUserColumn()
  @Column({
    type: 'bigint',
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
  })
  updatedById?: number;

  @SoftDeleteColumn(IsDeleteEnum.TRUE)
  @Column({ type: 'tinyint', unsigned: true, default: IsDeleteEnum.FALSE })
  isDelete?: IsDeleteEnum;

  @VersionColumn()
  version?: number;

  getId() {
    return this.id || generator.uuid();
  }

  @BeforeInsert()
  setId() {
    this.id = this.getId();
  }
}
