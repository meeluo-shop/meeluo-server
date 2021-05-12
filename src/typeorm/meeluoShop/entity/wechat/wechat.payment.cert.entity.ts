import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { Column, Entity, Scope, Index } from '@jiaxinjiang/nest-orm';
import { BaseEntity } from '@typeorm/base.entity';
import { idTransformer } from '@typeorm/base.entity';

@Scope<WechatPaymentCertEntity>([{ column: 'is_delete', value: 0 }])
@Entity('wechat_payment_cert', { database: MEELUO_SHOP_DATABASE })
export class WechatPaymentCertEntity extends BaseEntity {
  @Column('varchar', {
    length: 50,
    nullable: true,
    comment: '用户上传证书时的证书名字',
  })
  fileName: string;

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

  @Column('text', { nullable: true, comment: '证书内容（base64）' })
  content: string;
}
