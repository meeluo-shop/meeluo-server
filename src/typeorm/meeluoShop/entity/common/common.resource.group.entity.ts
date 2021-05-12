import {
  Column,
  Scope,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { BaseEntity, idTransformer } from '@typeorm/base.entity';
import { MerchantEntity } from '../merchant/merchant.entity';
import { CommonResourceEntity } from './common.resource.entity';
import { AgentEntity } from '../agent/agent.entity';

export enum CommonResourceGroupTypeEnum {
  OTHER = 0, // 其他资源
  IMAGE = 10, // 图片资源
}

@Scope<CommonResourceGroupEntity>([{ column: 'is_delete', value: 0 }])
@Entity('common_resource_group', { database: MEELUO_SHOP_DATABASE })
export class CommonResourceGroupEntity extends BaseEntity {
  @Column('tinyint', {
    comment: '分组类型，0其他资源，10图片资源，默认0',
    unsigned: true,
    default: CommonResourceGroupTypeEnum.OTHER,
  })
  type: CommonResourceGroupTypeEnum;

  @Column('varchar', { comment: '分组名称', length: 50 })
  name: string;

  @Column('int', {
    comment: '分组顺序',
    unsigned: true,
    nullable: true,
    default: 100,
  })
  order: number;

  @OneToMany(
    () => CommonResourceEntity,
    resource => resource.group,
  )
  @JoinColumn()
  resources?: CommonResourceEntity[] | undefined;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
    comment: '商户id，只有商户使用是才会有',
  })
  merchantId: number;

  @Column('bigint', {
    nullable: true,
    unsigned: true,
    transformer: idTransformer,
    comment: '代理商id',
  })
  agentId: number;

  @ManyToOne(() => MerchantEntity)
  @JoinColumn({ name: 'merchant_id', referencedColumnName: 'id' })
  merchant: MerchantEntity;

  @ManyToOne(() => AgentEntity)
  @JoinColumn({ name: 'agent_id', referencedColumnName: 'id' })
  agent: AgentEntity;
}
