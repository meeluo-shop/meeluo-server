import { Column, ManyToOne, JoinColumn } from '@jiaxinjiang/nest-orm';
import { BaseEntity, idTransformer } from '@typeorm/base.entity';
import { AgentEntity } from './agent.entity';

export abstract class AgentBaseEntity extends BaseEntity {
  @Column('bigint', {
    unsigned: true,
    transformer: idTransformer,
    comment: '代理商id',
  })
  agentId: number;

  @ManyToOne(() => AgentEntity)
  @JoinColumn({ name: 'agent_id', referencedColumnName: 'id' })
  agent: AgentEntity;
}
