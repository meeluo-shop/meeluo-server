import {
  Column,
  Scope,
  Entity,
  JoinColumn,
  Index,
  ManyToOne,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { BaseEntity, idTransformer } from '@typeorm/base.entity';
import { MerchantEntity } from '../merchant/merchant.entity';
import { CommonResourceGroupEntity } from './common.resource.group.entity';
import { AgentEntity } from '../agent/agent.entity';

export enum CommonResourceTypeEnum {
  OTHER = 0, // 其他
  IMAGE = 10, // 图片
}

export enum CommonResourceStorageEnum {
  OTHER = 0, // 其他
  QINIU = 10, // 七牛云
}

@Scope<CommonResourceEntity>([{ column: 'is_delete', value: 0 }])
@Entity('common_resource', { database: MEELUO_SHOP_DATABASE })
export class CommonResourceEntity extends BaseEntity {
  @Column('tinyint', {
    comment: '存储对象，0其他，10七牛云，默认0',
    unsigned: true,
    default: CommonResourceStorageEnum.OTHER,
  })
  storage: CommonResourceStorageEnum;

  @Column('varchar', { comment: '文件远程地址', length: 500 })
  url: string;

  @Column('varchar', { comment: '文件名称', length: 200 })
  name: string;

  @Index({ unique: true })
  @Column('varchar', { comment: '文件唯一标识', length: 200, select: false })
  uuid: string;

  @Column('int', { comment: '文件大小', unsigned: true, nullable: true })
  size: number;

  @Column('tinyint', {
    comment: '文件类型，0其他，10图片，默认0',
    unsigned: true,
    default: CommonResourceTypeEnum.OTHER,
    select: false,
  })
  type: CommonResourceTypeEnum;

  @Column('varchar', { comment: '文件后缀', length: 20 })
  extension: string;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
    comment: '资源分组',
  })
  groupId: number;

  @ManyToOne(() => CommonResourceGroupEntity)
  @JoinColumn({ name: 'group_id', referencedColumnName: 'id' })
  group: CommonResourceGroupEntity;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    transformer: idTransformer,
    comment: '商户id，只有商户使用时才会有',
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
