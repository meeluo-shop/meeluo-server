import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { Column, Entity, Scope, Index } from '@jiaxinjiang/nest-orm';
import { BaseEntity } from '@typeorm/base.entity';
import { idTransformer } from '@typeorm/base.entity';

@Scope<WechatQRCodeEntity>([{ column: 'is_delete', value: 0 }])
@Entity('wechat_qrcode', { database: MEELUO_SHOP_DATABASE })
export class WechatQRCodeEntity extends BaseEntity {
  @Column('varchar', { length: 50, nullable: true, comment: '商户APPID' })
  appid: string;

  @Index()
  @Column('varchar', {
    length: 200,
    nullable: true,
    comment: '获取的二维码ticket，凭借此ticket可以在有效时间内换取二维码',
  })
  ticket: string;

  @Column('int', {
    comment: '该二维码有效时间，以秒为单位。 最大不超过2592000（即30天）',
    unsigned: true,
    nullable: true,
  })
  expireSeconds: number;

  @Column('varchar', {
    length: 500,
    nullable: true,
    comment:
      '二维码图片解析后的地址，开发者可根据该地址自行生成需要的二维码图片',
  })
  url: string;

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
