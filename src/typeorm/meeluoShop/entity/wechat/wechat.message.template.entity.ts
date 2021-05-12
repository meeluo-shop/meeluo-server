import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { Column, Entity, Scope, Index } from '@jiaxinjiang/nest-orm';
import { BaseEntity } from '@typeorm/base.entity';
import { idTransformer } from '@typeorm/base.entity';

@Scope<WechatMessageTemplateEntity>([{ column: 'is_delete', value: 0 }])
@Entity('wechat_message_template', { database: MEELUO_SHOP_DATABASE })
export class WechatMessageTemplateEntity extends BaseEntity {
  @Column('varchar', { length: 50, nullable: true, comment: '商户APPID' })
  appid: string;

  @Column('varchar', {
    length: 50,
    nullable: true,
    comment: '消息模板short_id',
  })
  templateShortId: string;

  @Index()
  @Column('varchar', { length: 50, nullable: true, comment: '消息模板id' })
  templateId: string;

  @Column('varchar', { length: 50, nullable: true, comment: '消息模板标题' })
  title: string;

  @Column('varchar', { length: 1000, nullable: true, comment: '消息模板内容' })
  content: string;

  @Column('varchar', { length: 50, nullable: true, comment: '所属一级行业' })
  primaryIndustry: string;

  @Column('varchar', { length: 50, nullable: true, comment: '所属二级行业' })
  deputyIndustry: string;

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
}
