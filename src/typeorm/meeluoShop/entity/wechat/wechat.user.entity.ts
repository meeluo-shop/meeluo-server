import { Scope, Entity, Column, Index } from '@jiaxinjiang/nest-orm';
import { BaseEntity } from '@typeorm/base.entity';
import { MEELUO_SHOP_DATABASE } from '@core/constant';

export enum WechatUserGenderEnum {
  UNKNOWN = 0,
  MAN = 1,
  WOMAN = 2,
}

export enum WechatAppTypeEnum {
  MINI_PROGRAM = 10, // 小程序
  OFFICIAL_ACCOUNT = 20, // 公众号
}

export enum WechatUserSubscribeEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum WechatUserSubscribedGameEnum {
  TRUE = 1,
  FALSE = 0,
}

@Scope<WechatUserEntity>([{ column: 'is_delete', value: 0 }])
@Entity('wechat_user', { database: MEELUO_SHOP_DATABASE })
export class WechatUserEntity extends BaseEntity {
  @Index()
  @Column('varchar', {
    nullable: true,
    comment: '微信公众号unionid',
    length: 50,
  })
  unionid: string;

  @Index({ unique: true })
  @Column('varchar', {
    comment: '微信公众号openid(唯一标识)',
    length: 50,
    nullable: true,
  })
  openid: string;

  @Column('tinyint', {
    comment: '微信应用类型，10小程序，20公众号',
    unsigned: true,
  })
  appType: WechatAppTypeEnum;

  @Column('varchar', {
    comment: '微信用户昵称',
    length: 128,
    nullable: true,
    default: '',
  })
  nickname: string;

  @Column('varchar', {
    comment: '微信appid',
    length: 50,
    nullable: true,
  })
  appId: string;

  @Column('tinyint', {
    comment: '性别',
    unsigned: true,
    default: WechatUserGenderEnum.UNKNOWN,
  })
  gender: WechatUserGenderEnum;

  @Column('varchar', {
    comment: '微信用户头像',
    length: 512,
    nullable: true,
  })
  avatar: string;

  @Column('varchar', {
    comment: '国家',
    length: 100,
    nullable: true,
  })
  country: string;

  @Column('varchar', {
    comment: '省份',
    length: 100,
    nullable: true,
  })
  province: string;

  @Column('varchar', {
    comment: '城市',
    length: 100,
    nullable: true,
  })
  city: string;

  @Column('tinyint', {
    comment: '是否关注公众号，0未关注，1已关注',
    unsigned: true,
    default: WechatUserSubscribeEnum.FALSE,
  })
  subscribe?: WechatUserSubscribeEnum;

  @Column('timestamp', { comment: '最后一次关注时间', nullable: true })
  subscribeTime?: Date;

  @Column('tinyint', {
    comment: '是否关注过公众号获得游戏挑战次数，0否，1是',
    unsigned: true,
    default: WechatUserSubscribedGameEnum.FALSE,
  })
  subscribedGame: WechatUserSubscribedGameEnum;
}
