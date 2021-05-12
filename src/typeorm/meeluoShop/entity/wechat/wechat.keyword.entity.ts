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
import { WechatMaterialEntity } from './wechat.material.entity';

export enum WechatKeywordMsgTypeEnum {
  TEXT = 10,
  IMAGE = 20,
  VOICE = 30,
  VIDEO = 40,
  NEWS = 50,
}

export enum WechatKeywordIsActiveEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<WechatKeywordEntity>([{ column: 'is_delete', value: 0 }])
@Entity('wechat_keyword', { database: MEELUO_SHOP_DATABASE })
export class WechatKeywordEntity extends BaseEntity {
  @Column('varchar', { length: 50, nullable: true, comment: '微信公众号APPID' })
  appid: string;

  @Column('varchar', {
    comment: '关键字',
    length: 50,
    default: '',
  })
  keyword: string;

  @Column('tinyint', {
    comment: '消息类型 10=文字，20=图片，30=音频，40=视频，50=图文',
    unsigned: true,
    default: WechatKeywordMsgTypeEnum.TEXT,
  })
  type: WechatKeywordMsgTypeEnum;

  @Column('longtext', { nullable: true, comment: '文字内容' })
  text: string;

  @Column('varchar', {
    comment: '图文标题',
    length: 200,
    nullable: true,
  })
  title: string;

  @Column('varchar', {
    comment: '图文描述',
    length: 500,
    nullable: true,
  })
  introduction: string;

  @Column('varchar', {
    comment: '图片地址',
    length: 500,
    nullable: true,
  })
  imageUrl: string;

  @Column('varchar', {
    comment: '图文链接',
    length: 500,
    nullable: true,
  })
  linkUrl: string;

  @Column('bigint', {
    unsigned: true,
    comment: '素材集id',
    nullable: true,
    transformer: idTransformer,
  })
  materialId: number;

  @Column('tinyint', {
    comment: '是否启用，默认1',
    unsigned: true,
    default: WechatKeywordIsActiveEnum.TRUE,
  })
  isActive: WechatKeywordIsActiveEnum = WechatKeywordIsActiveEnum.TRUE;

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
  material?: WechatMaterialEntity;
}
