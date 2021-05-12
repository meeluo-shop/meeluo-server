import {
  Column,
  Scope,
  Entity,
  ManyToOne,
  JoinColumn,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { BaseEntity, idTransformer } from '@typeorm/base.entity';
import { AgentEntity } from '../agent/agent.entity';

export enum MerchantRegisterModeEnum {
  SELF = 0, // 自己注册
  ADMIN = 1, // 管理员开通
  AGENT = 2, // 代理商开通
}

export enum MerchantIsActiveEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum MerchantAllowPrivateWechatEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum MerchantTypeEnum {
  SHOP = 10, // 商城
  RESTAURANT = 20, // 餐饮
}

@Scope<MerchantEntity>([{ column: 'is_delete', value: 0 }])
@Entity('merchant', { database: MEELUO_SHOP_DATABASE })
export class MerchantEntity extends BaseEntity {
  @Column('varchar', { comment: '商户名称', length: 100 })
  name: string;

  @Column('varchar', { comment: '商户介绍', length: 1000, nullable: true })
  remark: string;

  @Column('varchar', { comment: '门店名称', length: 100, nullable: true })
  storeName: string;

  @Column('varchar', { comment: '门店介绍', length: 1000, nullable: true })
  storeDesc: string;

  @Column('varchar', { length: 500, nullable: true, comment: '门店图标' })
  logo: string;

  @Column('varchar', { length: 500, nullable: true, comment: '门头照片' })
  doorPhoto: string;

  @Column('tinyint', {
    comment: '开通方式',
    unsigned: true,
    default: MerchantRegisterModeEnum.SELF,
  })
  registerMode: MerchantRegisterModeEnum;

  @Column('varchar', { comment: '公司主体名称', length: 100, nullable: true })
  companyName: string;

  @Column('varchar', { comment: '法人姓名', length: 50, nullable: true })
  legalPersonName: string;

  @Column('varchar', { comment: '法人身份证号', length: 50, nullable: true })
  legalPersonIdCard: string;

  @Column('varchar', { comment: '法人身份证照片', length: 250, nullable: true })
  legalPersonIdCardPhoto: string;

  @Column('varchar', { comment: '营业执照照片', length: 250, nullable: true })
  businessLicensePhoto: string;

  @Column('varchar', { comment: '联系人', length: 50, nullable: true })
  liaison: string;

  @Column('varchar', { comment: '联系电话', length: 50, nullable: true })
  phone: string;

  @Column('varchar', {
    comment: '商户所在详细地址',
    length: 500,
    nullable: true,
  })
  address: string;

  @Column('varchar', { comment: '经度（浮点数）', length: 100, nullable: true })
  longitude: string;

  @Column('varchar', { comment: '纬度（浮点数）', length: 100, nullable: true })
  latitude: string;

  @Column('timestamp', { comment: '过期时间，null为永不过期', nullable: true })
  expireTime: Date;

  @Column('int', { comment: '省份编号', unsigned: true, nullable: true })
  provinceCode: number;

  @Column('int', { comment: '城市编号', unsigned: true, nullable: true })
  cityCode: number;

  @Column('int', { comment: '县市区编号', unsigned: true, nullable: true })
  countyCode: number;

  @Column('varchar', {
    length: 200,
    nullable: true,
    comment: '获取的二维码ticket，凭借此ticket可以在有效时间内换取二维码',
  })
  qrcodeTicket: string;

  @Column('tinyint', {
    comment: '是否启用',
    unsigned: true,
    default: MerchantIsActiveEnum.TRUE,
  })
  isActive: MerchantIsActiveEnum;

  @Column('tinyint', {
    comment: '商户类型，10商城，20餐饮，默认10',
    unsigned: true,
    default: MerchantTypeEnum.SHOP,
  })
  type: MerchantTypeEnum;

  @Column('tinyint', {
    comment: '是否允许使用独立的微信公众号',
    unsigned: true,
    default: MerchantAllowPrivateWechatEnum.TRUE,
  })
  allowPrivateWechat: MerchantAllowPrivateWechatEnum;

  @Column('bigint', {
    unsigned: true,
    transformer: idTransformer,
    nullable: true,
  })
  agentId: number;

  @ManyToOne(() => AgentEntity)
  @JoinColumn()
  agent: AgentEntity;

  provinceName?: string;
  cityName?: string;
  countyName?: string;
}
