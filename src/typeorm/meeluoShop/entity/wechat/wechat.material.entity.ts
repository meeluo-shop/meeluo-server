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
import { WechatMaterialTextEntity } from './wechat.material.text.entity';

export enum WechatMaterialFileTypeEnum {
  IMAGE = 10,
  VOICE = 20,
  VIDEO = 30,
  TEXT = 40,
}

@Scope<WechatMaterialEntity>([{ column: 'is_delete', value: 0 }])
@Entity('wechat_material', { database: MEELUO_SHOP_DATABASE })
export class WechatMaterialEntity extends BaseEntity {
  @Column('varchar', { length: 50, nullable: true, comment: '微信公众号APPID' })
  appid: string;

  @Column('varchar', {
    comment: '素材名称',
    length: 50,
    default: '',
  })
  name: string;

  @Column('tinyint', {
    comment: '文件类型 10=图片，20=音频，30=视频，40=图文',
    unsigned: true,
    default: WechatMaterialFileTypeEnum.IMAGE,
  })
  fileType: WechatMaterialFileTypeEnum;

  @Column('varchar', {
    comment: '素材网络地址',
    length: 255,
    default: '',
  })
  url: string;

  @Column('bigint', {
    unsigned: true,
    nullable: true,
    comment: '资源id',
    transformer: idTransformer,
  })
  resourceId: number;

  @Column('varchar', {
    comment: '素材media_id',
    length: 50,
    default: '',
  })
  mediaId: string;

  @Column('varchar', {
    comment: '视频素材描述',
    length: 50,
    default: '',
  })
  introduction: string;

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

  @ManyToOne(() => CommonResourceEntity)
  @JoinColumn({ name: 'resource_id', referencedColumnName: 'id' })
  resource?: CommonResourceEntity | undefined;

  materialTextList?: WechatMaterialTextEntity[];
}
