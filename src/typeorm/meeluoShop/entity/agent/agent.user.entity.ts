import { Column, Scope, Entity, BeforeInsert } from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { AgentBaseEntity } from './agent.base.entity';
import { CryptoHelperProvider } from '@shared/helper';

export enum AgentUserGenderEnum {
  UNKNOWN = 0,
  MAN = 1,
  WOMAN = 2,
}

export enum AgentUserIsNativeEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum AgentUserIsActiveEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<AgentUserEntity>([{ column: 'is_delete', value: 0 }])
@Entity('agent_user', { database: MEELUO_SHOP_DATABASE })
export class AgentUserEntity extends AgentBaseEntity {
  @Column('varchar', {
    comment: '公众号openid(唯一标识)',
    length: 50,
    nullable: true,
  })
  openid: string;

  @Column('varchar', { length: 255, comment: '用户名', nullable: true })
  username: string;

  @Column('varchar', { comment: '密码', length: 255 })
  password: string;

  @Column('varchar', { comment: '真实姓名', length: 50, nullable: true })
  realname: string;

  @Column('varchar', { comment: '用户昵称', length: 50, nullable: true })
  nickname: string;

  @Column('varchar', { length: 255, comment: '头像', nullable: true })
  avatar: string;

  @Column('tinyint', {
    comment: '性别',
    unsigned: true,
    default: AgentUserGenderEnum.UNKNOWN,
  })
  gender: AgentUserGenderEnum;

  @Column('tinyint', {
    comment: '是否是创建代理商时的指定用户',
    unsigned: true,
    default: AgentUserIsNativeEnum.FALSE,
  })
  isNative: AgentUserIsNativeEnum;

  @Column('tinyint', {
    comment: '是否启用',
    unsigned: true,
    default: AgentUserIsActiveEnum.TRUE,
  })
  isActive: AgentUserIsActiveEnum;

  @Column('varchar', { comment: '电子邮箱', length: 50 })
  email: string;

  @Column('varchar', { comment: '手机号码', length: 50 })
  phone: string;

  @Column('timestamp', { comment: '首次登陆时间', nullable: true })
  firstLoginTime?: Date;

  @Column('timestamp', { comment: '最后一次登陆时间', nullable: true })
  lastLoginTime: Date;

  @BeforeInsert()
  transformColumnValue() {
    this.password = CryptoHelperProvider.hash(this.password);
  }
}
