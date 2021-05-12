import { CommonTerminalEnum } from '@app/common/common.enum';
import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@shared/swagger';
import {
  WechatPaymentOrderSignTypeEnum,
  WechatPaymentOrderTradeStateEnum,
  WechatPaymentOrderTradeTypeEnum,
} from '@typeorm/meeluoShop';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export enum WechatMessageTypeEnum {
  EVENT = 'event',
  TEXT = 'text',
  IMAGE = 'image',
  VOICE = 'voice',
  VIDEO = 'video',
  SHORT_VIDEO = 'shortvideo',
  LOCATION = 'location',
  LINK = 'link',
}

export enum WechatEventTypeEnum {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  SCAN = 'SCAN',
  LOCATION = 'LOCATION',
  CLICK = 'CLICK',
  VIEW = 'VIEW',
}

export class WechatCallbackParamDTO {
  @ApiProperty({
    description: '商户或代理商id',
  })
  @Type(() => Number)
  @IsInt({ message: 'id必须为数字类型' })
  id: number;

  @ApiProperty({
    enum: CommonTerminalEnum,
    description: '客户端类型，10 代理商， 20 商户',
  })
  @Type(() => Number)
  @IsEnum(CommonTerminalEnum)
  type: CommonTerminalEnum;
}

export class WechatNotifyCheckSignDTO {
  @ApiProperty({
    description: '生成的签名',
  })
  @IsString()
  signature: string;

  @ApiProperty({
    required: false,
    description: '签名参数',
  })
  @IsOptional()
  @IsString()
  echostr: string;

  @ApiProperty({
    description: '时间戳',
  })
  @IsString()
  timestamp: string;

  @ApiProperty({
    description: '随机数',
  })
  @IsString()
  nonce: string;
}

export class WechatNotifyCallbackDTO {
  @ApiProperty({
    description: '开发者微信号',
  })
  @IsString()
  toUserName: string;

  @ApiProperty({
    description: '发送方帐号（一个OpenID）',
  })
  @IsString()
  fromUserName: string;

  @ApiProperty({
    description: '消息创建时间 （整型）',
  })
  @Type(() => Number)
  @IsInt()
  createTime: number;

  @ApiProperty({
    description: '消息类型',
  })
  @IsString()
  msgType: WechatMessageTypeEnum;

  @ApiProperty({
    required: false,
    description: '消息标题',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    required: false,
    description: '消息描述',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    description: '消息链接',
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({
    required: false,
    description: '地理位置纬度',
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  locationX?: string;

  @ApiProperty({
    required: false,
    description: '地理位置经度',
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  locationY?: string;

  @ApiProperty({
    required: false,
    description: '地图缩放大小',
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  scale?: string;

  @ApiProperty({
    required: false,
    description: '地理位置信息',
  })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({
    required: false,
    description: '视频消息缩略图的媒体id，可以调用多媒体文件下载接口拉取数据',
  })
  @IsOptional()
  @IsString()
  thumbMediaId?: string;

  @ApiProperty({
    required: false,
    description: '语音格式，如amr，speex等',
  })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiProperty({
    required: false,
    description: '语音识别结果，UTF8编码',
  })
  @IsOptional()
  @IsString()
  recognition?: string;

  @ApiProperty({
    required: false,
    description: '图片链接（由系统生成）',
  })
  @IsOptional()
  @IsString()
  picUrl?: string;

  @ApiProperty({
    required: false,
    description: '消息媒体id，可以调用获取临时素材接口拉取数据',
  })
  @IsOptional()
  @IsString()
  mediaId?: string;

  @ApiProperty({
    required: false,
    description: '消息id，64位整型',
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  msgId?: string;

  @ApiProperty({
    required: false,
    description: '文本消息内容',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    required: false,
    description: '事件类型',
  })
  @IsOptional()
  @IsString()
  event?: WechatEventTypeEnum;

  @ApiProperty({
    required: false,
    description: '事件KEY值',
  })
  @IsOptional()
  @IsString()
  eventKey?: string;

  @ApiProperty({
    required: false,
    description: '二维码的ticket，可用来换取二维码图片',
  })
  @IsOptional()
  @IsString()
  ticket?: string;

  @ApiProperty({
    required: false,
    description: '地理位置纬度',
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  latitude?: string;

  @ApiProperty({
    required: false,
    description: '地理位置经度',
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  longitude?: string;

  @ApiProperty({
    required: false,
    description: '地理位置精度',
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  precision?: string;
}

export class WechatPaymentCallbackDTO {
  @ApiProperty({
    description: '返回状态码',
  })
  @MaxLength(50)
  returnCode: 'SUCCESS' | 'FAIL';

  @ApiProperty({
    required: false,
    description: '返回信息，如非空，为错误原因',
  })
  @IsOptional()
  @MaxLength(128)
  returnMsg?: string;

  @ApiProperty({
    required: false,
    description: '服务商商户的APPID',
  })
  @IsOptional()
  @MaxLength(50)
  appid?: string;

  @ApiProperty({
    required: false,
    description: '微信支付分配的商户号',
  })
  @IsOptional()
  @MaxLength(50)
  mchId?: string;

  @ApiProperty({
    required: false,
    description: '当前调起支付的公众号APPID',
  })
  @IsOptional()
  @MaxLength(50)
  subAppid?: string;

  @ApiProperty({
    required: false,
    description: '微信支付分配的子商户号',
  })
  @IsOptional()
  @MaxLength(50)
  subMchId?: string;

  @ApiProperty({
    required: false,
    description: '微信支付分配的终端设备号',
  })
  @IsOptional()
  @MaxLength(50)
  deviceInfo?: string;

  @ApiProperty({
    required: false,
    description: '随机字符串，不长于32位',
  })
  @IsOptional()
  @MaxLength(50)
  nonceStr?: string;

  @ApiProperty({
    required: false,
    description: '数据签名',
  })
  @IsOptional()
  @MaxLength(50)
  sign?: string;

  @ApiProperty({
    required: false,
    enum: WechatPaymentOrderSignTypeEnum,
    description: '签名类型',
  })
  @IsOptional()
  @IsEnum(WechatPaymentOrderSignTypeEnum)
  signType?: WechatPaymentOrderSignTypeEnum;

  @ApiProperty({
    required: false,
    description: '用户openid',
  })
  @IsOptional()
  @MaxLength(150)
  openid?: string;

  @ApiProperty({
    required: false,
    description: '是否关注公众号',
  })
  @IsOptional()
  @MaxLength(10)
  isSubscribe?: 'Y' | 'N';

  @ApiProperty({
    required: false,
    description: '用户在子商户appid下的唯一标识',
  })
  @IsOptional()
  @MaxLength(150)
  subOpenid?: string;

  @ApiProperty({
    required: false,
    description: '是否关注子公众号，0未关注，1已关注',
  })
  @IsOptional()
  @MaxLength(10)
  subIsSubscribe?: 'Y' | 'N';

  @ApiProperty({
    required: false,
    enum: WechatPaymentOrderTradeTypeEnum,
    description: '交易类型：JSAPI、NATIVE、APP',
  })
  @IsOptional()
  @IsEnum(WechatPaymentOrderTradeTypeEnum)
  tradeType?: WechatPaymentOrderTradeTypeEnum;

  @ApiProperty({
    required: false,
    enum: WechatPaymentOrderTradeStateEnum,
    description:
      '交易状态，SUCCESS—支付成功，REFUND—转入退款，NOTPAY—未支付，CLOSED—已关闭，REVOKED—已撤销（付款码支付），USERPAYING--用户支付中（付款码支付），PAYERROR--支付失败(其他原因，如银行返回失败)',
  })
  @IsOptional()
  @IsEnum(WechatPaymentOrderTradeStateEnum)
  tradeState?: WechatPaymentOrderTradeStateEnum;

  @ApiProperty({
    required: false,
    description: '银行类型，采用字符串类型的银行标识',
  })
  @IsOptional()
  @MaxLength(50)
  bankType?: string;

  @ApiProperty({
    required: false,
    description: '订单总金额，单位为分',
  })
  @IsOptional()
  totalFee?: number;

  @ApiProperty({
    required: false,
    description: '货币类型，符合ISO 4217标准的三位字母代码，默认人民币：CNY',
  })
  @IsOptional()
  @MaxLength(10)
  feeType?: string;

  @ApiProperty({
    required: false,
    description: '现金支付金额订单现金支付金额，单位为分',
  })
  @IsOptional()
  cashFee?: number;

  @ApiProperty({
    required: false,
    description: '货币类型，符合ISO 4217标准的三位字母代码，默认人民币：CNY',
  })
  @IsOptional()
  @MaxLength(10)
  cashFeeType?: string;

  @ApiProperty({
    required: false,
    description:
      '应结订单金额=订单金额-非充值代金券金额，应结订单金额<=订单金额',
  })
  @IsOptional()
  settlementTotalFee?: number;

  @ApiProperty({
    required: false,
    description: '微信支付订单号',
  })
  @IsOptional()
  @MaxLength(50)
  transactionId?: string;

  @ApiProperty({
    required: false,
    description:
      '商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*@ ，且在同一个商户号下唯一',
  })
  @IsOptional()
  @MaxLength(50)
  outTradeNo?: string;

  @ApiProperty({
    required: false,
    description: '商家数据包，原样返回',
  })
  @IsOptional()
  @MaxLength(150)
  attach?: string;

  @ApiProperty({
    required: false,
    description: '支付完成时间，格式为yyyyMMddHHmmss',
  })
  @IsOptional()
  @MaxLength(20)
  timeEnd?: string;
}
