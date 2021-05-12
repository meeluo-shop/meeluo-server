import { Index, Column, Entity, Scope } from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { BaseEntity, idTransformer } from '@typeorm/base.entity';

@Scope<CommonSettingEntity>([{ column: 'is_delete', value: 0 }])
@Entity('common_setting', { database: MEELUO_SHOP_DATABASE })
export class CommonSettingEntity extends BaseEntity {
  @Column('varchar', { comment: '设置项标识', length: 50 })
  code: string;

  @Column('varchar', { comment: '设置项子标识', nullable: true, length: 50 })
  subCode: string;

  @Column('varchar', { comment: '设置项描述', length: 255 })
  remark: string;

  @Column('mediumtext', { comment: '设置内容（json格式）' })
  content: string;

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
