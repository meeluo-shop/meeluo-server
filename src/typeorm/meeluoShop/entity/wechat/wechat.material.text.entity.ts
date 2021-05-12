import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  Column,
  Entity,
  Scope,
  Index,
  ManyToOne,
  JoinColumn,
} from '@jiaxinjiang/nest-orm';
import { BaseEntity } from '@typeorm/base.entity';
import { idTransformer } from '@typeorm/base.entity';
import { CommonResourceEntity } from '../common';
import { WechatMaterialEntity } from './wechat.material.entity';

@Scope<WechatMaterialTextEntity>([{ column: 'is_delete', value: 0 }])
@Entity('wechat_material_text', { database: MEELUO_SHOP_DATABASE })
export class WechatMaterialTextEntity extends BaseEntity {
  @Column('varchar', { length: 50, nullable: true, comment: '微信公众号APPID' })
  appid: string;

  @Column('bigint', {
    unsigned: true,
    comment: '素材集id',
    transformer: idTransformer,
  })
  materialId: number;

  @Column('tinyint', {
    comment: '素材信息序号',
    unsigned: true,
    default: 0,
  })
  order: number;

  @Column('varchar', {
    comment: '标题',
    length: 100,
    default: '',
  })
  title: string;

  @Column('varchar', {
    comment: '作者',
    length: 50,
    default: '',
  })
  author: string;

  @Column('varchar', {
    comment: '摘要',
    length: 255,
    default: '',
  })
  digest: string;

  @Column('longtext', { comment: '正文' })
  content: string;

  @Column('varchar', {
    comment: '素材media_id',
    length: 50,
    default: '',
  })
  mediaId: string;

  @Column('varchar', {
    comment: '封面网络地址',
    length: 255,
    default: '',
  })
  url: string;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    comment: '封面资源id',
    transformer: idTransformer,
  })
  resourceId: number;

  @Column('varchar', {
    comment: '图文链接地址',
    length: 255,
    default: '#',
  })
  contentSourceUrl: string;

  @Index()
  @Column('bigint', {
    nullable: true,
    unsigned: true,
    transformer: idTransformer,
    comment: '商户id',
  })
  merchantId: number;

  @Index()
  @Column('bigint', {
    nullable: true,
    unsigned: true,
    transformer: idTransformer,
    comment: '代理商id',
  })
  agentId: number;

  @ManyToOne(() => WechatMaterialEntity)
  @JoinColumn({ name: 'material_id', referencedColumnName: 'id' })
  material?: WechatMaterialEntity | undefined;

  @ManyToOne(() => CommonResourceEntity)
  @JoinColumn({ name: 'resource_id', referencedColumnName: 'id' })
  resource?: CommonResourceEntity | undefined;
}
