import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { Column, Entity, Index, Scope } from '@jiaxinjiang/nest-orm';
import { BaseEntity } from '@typeorm/base.entity';
import { idTransformer } from '@typeorm/base.entity';

export enum WechatPaymentOrderSignTypeEnum {
  MD5 = 'MD5',
  HMAC_SHA256 = 'HMAC-SHA256',
}

export enum WechatPaymentOrderIsSubscribeEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum WechatPaymentOrderSceneEnum {
  OTHER = 0, // 其他场景
  PLAY_GAME = 10, // 挑战活动游戏
  RECHARGE = 20, // 用户充值
  BUY_GOODS = 30, // 商品订单
}

export enum WechatPaymentOrderTradeTypeEnum {
  JSAPI = 'JSAPI',
  NATIVE = 'NATIVE',
  APP = 'APP',
}

export enum WechatPaymentOrderTradeStateEnum {
  SUCCESS = 'SUCCESS', // 支付成功
  REFUND = 'REFUND', // 转入退款
  NOTPAY = 'NOTPAY', // 未支付
  CLOSED = 'CLOSED', // 已关闭
  REVOKED = 'REVOKED', // 已撤销（付款码支付）
  USERPAYING = 'USERPAYING', // 用户支付中（付款码支付）
  PAYERROR = 'PAYERROR', // 支付失败(其他原因，如银行返回失败)
}

@Scope<WechatPaymentOrderEntity>([{ column: 'is_delete', value: 0 }])
@Entity('wechat_payment_order', { database: MEELUO_SHOP_DATABASE })
export class WechatPaymentOrderEntity extends BaseEntity {
  @Column('varchar', { length: 50, comment: '服务商商户的APPID' })
  appid: string;

  @Column('varchar', { length: 50, comment: '微信支付分配的商户号' })
  mchId: string;

  @Column('varchar', {
    length: 50,
    nullable: true,
    comment: '当前调起支付的公众号APPID',
  })
  subAppid: string;

  @Column('varchar', {
    length: 50,
    nullable: true,
    comment: '微信支付分配的子商户号',
  })
  subMchId: string;

  @Column('varchar', {
    length: 50,
    nullable: true,
    comment: '微信支付分配的终端设备号',
  })
  deviceInfo?: string;

  @Column('varchar', {
    length: 50,
    nullable: true,
    comment: '随机字符串，不长于32位',
  })
  nonceStr: string;

  @Column('varchar', {
    length: 50,
    nullable: true,
    comment: '数据签名',
  })
  sign: string;

  @Column('varchar', {
    length: 30,
    nullable: true,
    comment: '签名类型，目前支持HMAC-SHA256和MD5，默认为MD5',
  })
  signType: WechatPaymentOrderSignTypeEnum;

  @Column('varchar', {
    length: 150,
    nullable: true,
    comment: '用户在商户appid下的唯一标识',
  })
  openid: string;

  @Column('tinyint', {
    comment: '是否关注公众号，0未关注，1已关注',
    unsigned: true,
    default: WechatPaymentOrderIsSubscribeEnum.FALSE,
  })
  isSubscribe: WechatPaymentOrderIsSubscribeEnum;

  @Column('varchar', {
    length: 150,
    nullable: true,
    comment: '用户在子商户appid下的唯一标识',
  })
  subOpenid?: string;

  @Column('tinyint', {
    comment: '是否关注子公众号，0未关注，1已关注',
    unsigned: true,
    nullable: true,
    default: WechatPaymentOrderIsSubscribeEnum.FALSE,
  })
  subIsSubscribe?: WechatPaymentOrderIsSubscribeEnum;

  @Column('varchar', {
    length: 10,
    comment: '交易类型：JSAPI、NATIVE、APP',
    default: WechatPaymentOrderTradeTypeEnum.JSAPI,
  })
  tradeType: WechatPaymentOrderTradeTypeEnum;

  @Column('varchar', {
    length: 10,
    nullable: true,
    comment:
      '交易状态，SUCCESS—支付成功，REFUND—转入退款，NOTPAY—未支付，CLOSED—已关闭，REVOKED—已撤销（付款码支付），USERPAYING--用户支付中（付款码支付），PAYERROR--支付失败(其他原因，如银行返回失败)',
  })
  tradeState: WechatPaymentOrderTradeStateEnum;

  @Column('varchar', {
    length: 50,
    nullable: true,
    comment: '银行类型，采用字符串类型的银行标识',
  })
  bankType: string;

  @Column('int', {
    comment: '订单总金额，单位为分',
    unsigned: true,
    default: 0,
  })
  totalFee: number;

  @Column('varchar', {
    length: 10,
    nullable: true,
    default: 'CNY',
    comment: '货币类型，符合ISO 4217标准的三位字母代码，默认人民币：CNY',
  })
  feeType?: string;

  @Column('int', {
    comment: '现金支付金额订单现金支付金额，单位为分',
    unsigned: true,
    default: 0,
  })
  cashFee: number;

  @Column('varchar', {
    length: 10,
    nullable: true,
    default: 'CNY',
    comment: '货币类型，符合ISO 4217标准的三位字母代码，默认人民币：CNY',
  })
  cashFeeType?: string;

  @Column('int', {
    comment: '应结订单金额=订单金额-非充值代金券金额，应结订单金额<=订单金额',
    unsigned: true,
    nullable: true,
    default: 0,
  })
  settlementTotalFee?: number;

  @Index()
  @Column('varchar', { length: 50, comment: '微信支付订单号' })
  transactionId: string;

  @Index()
  @Column('varchar', {
    length: 50,
    nullable: true,
    comment:
      '商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*@ ，且在同一个商户号下唯一',
  })
  outTradeNo: string;

  @Column('varchar', {
    length: 150,
    nullable: true,
    comment: '商家数据包，原样返回',
  })
  attach?: string;

  @Column('varchar', {
    length: 20,
    nullable: true,
    comment: '支付完成时间，格式为yyyyMMddHHmmss',
  })
  timeEnd: string;

  @Column('tinyint', {
    comment: '支付场景, 10 挑战活动游戏, 20 用户充值, 30 商品订单, 0 其他',
    unsigned: true,
    nullable: true,
    default: WechatPaymentOrderSceneEnum.OTHER,
  })
  scene?: WechatPaymentOrderSceneEnum;

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

  @Column('bigint', {
    unsigned: true,
    transformer: idTransformer,
    comment: '用户id',
    nullable: true,
  })
  userId?: number;
}
