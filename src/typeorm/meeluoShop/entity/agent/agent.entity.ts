import { Column, Scope, Entity } from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { BaseEntity } from '@typeorm/base.entity';

export enum AgentIsActiveEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<AgentEntity>([{ column: 'is_delete', value: 0 }])
@Entity('agent', { database: MEELUO_SHOP_DATABASE })
export class AgentEntity extends BaseEntity {
  @Column('varchar', { comment: '代理商名称', length: 100 })
  name: string;

  @Column('varchar', { comment: '代理商介绍', length: 1000, nullable: true })
  remark: string;

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

  @Column('timestamp', { comment: '过期时间，null为永不过期', nullable: true })
  expireTime: Date;

  @Column('int', {
    comment: '最多可开通的商户数量，0为不限制，默认为0',
    default: 0,
  })
  maxMerchantCount: number;

  @Column('tinyint', {
    comment: '是否启用',
    unsigned: true,
    default: AgentIsActiveEnum.TRUE,
  })
  isActive: AgentIsActiveEnum;
}
