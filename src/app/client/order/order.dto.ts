import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsMobilePhone,
  IsNumberString,
  IsOptional,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  MerchantOrderPayTypeEnum,
  MerchantOrderDeliveryTypeEnum,
  MerchantOrderEntity,
} from '@typeorm/meeluoShop';
import { MerchantOrderListStatusEnum } from '@app/merchant/order';

// 是否使用积分抵扣
export enum ClientOrderIsUsePointsEnum {
  TRUE = 1,
  FALSE = 0,
}

export class ClientOrderPaymentDTO {
  @ApiProperty({
    enum: MerchantOrderPayTypeEnum,
    description: '支付方式：10 微信支付 20 余额支付',
  })
  @Type(() => Number)
  @IsEnum(MerchantOrderPayTypeEnum)
  payType: MerchantOrderPayTypeEnum;
}

export class ClientOrderPickUpGoodsDTO {
  @ApiProperty({
    description: '订单id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的订单id' })
  orderId: number;

  @ApiProperty({
    description: '发放的商品id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的订单商品id' })
  orderGoodsId: number;
}

export class ClientOrderPaySignData {
  @ApiProperty({
    description: '系统生成的订单号',
  })
  orderNo: string;

  @ApiProperty({
    description: '微信支付签名',
  })
  paySign: string;

  @ApiProperty({
    description: '签名算法，暂支持 MD5',
  })
  signType: string;

  @ApiProperty({
    description: '时间戳从1970年1月1日00:00:00至今的秒数,即当前的时间 ',
  })
  timeStamp: string;

  @ApiProperty({
    description: '随机字符串，长度为32个字符以下',
  })
  nonceStr: string;

  @ApiProperty({
    description: '统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=*',
  })
  package: string;
}

export class ClientOrderSubmitRespDTO {
  order: MerchantOrderEntity;
  paySignData?: ClientOrderPaySignData;
}

export class ClientOrderGoodsSkusDTO {
  @ApiProperty({
    required: false,
    description: '商品id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的商品id' })
  goodsId: number;

  @ApiProperty({
    required: false,
    default: '',
    type: String,
    description: '商品sku记录索引 (由多个规格id拼接组成)，单规格无需填写',
  })
  @Type(() => String)
  @IsOptional()
  @MaxLength(200)
  specSkuId = '';

  @ApiProperty({
    type: Number,
    default: 1,
    required: false,
    description: '商品数量',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的商品数量' })
  goodsNum = 1;
}

export class ClientOrderDeliveryFeeDTO {
  @ApiProperty({
    description: '城市地区行政编码',
  })
  @IsNumberString({}, { message: '错误的城市地区行政编码' })
  cityId: string;

  @Type(() => ClientOrderGoodsSkusDTO)
  @ValidateNested({ each: true })
  goodsSkus: ClientOrderGoodsSkusDTO[];
}

export class ClientOrderSubmitDTO {
  @ApiProperty({
    enum: MerchantOrderDeliveryTypeEnum,
    description: '订单配送类型：20 邮寄配送 10 到店自提',
  })
  @Type(() => Number)
  @IsEnum(MerchantOrderDeliveryTypeEnum)
  deliveryType: MerchantOrderDeliveryTypeEnum;

  @ApiProperty({
    required: false,
    description: '收货地址id。deliveryType 为 20 时必填',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的收货地址id' })
  addressId?: number;

  @ApiProperty({
    required: false,
    description: '优惠券id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的优惠券id' })
  couponId?: number;

  @ApiProperty({
    enum: ClientOrderIsUsePointsEnum,
    description: '是否使用积分抵扣：1 是 0 否',
  })
  @Type(() => Number)
  @IsEnum(ClientOrderIsUsePointsEnum)
  usePointsDiscount: ClientOrderIsUsePointsEnum;

  @ApiProperty({
    enum: MerchantOrderPayTypeEnum,
    description: '支付方式：10 微信支付 20 余额支付',
  })
  @Type(() => Number)
  @IsEnum(MerchantOrderPayTypeEnum)
  payType: MerchantOrderPayTypeEnum;

  @ApiProperty({
    required: false,
    description: '买家留言，选填',
  })
  @IsOptional()
  @MaxLength(50, { message: '留言长度不能超过50' })
  remark: string;

  @ApiProperty({
    required: false,
    description: '上门联系人，deliveryType 为 10 时必填',
  })
  @IsOptional()
  @MaxLength(20, { message: '联系姓名长度不能超过20' })
  linkman: string;

  @ApiProperty({
    required: false,
    description: '上门联系人电话号，deliveryType 为 10 时必填',
  })
  @IsOptional()
  @IsMobilePhone('zh-CN', {}, { message: '错误的手机号码格式' })
  phone: string;

  @Type(() => ClientOrderGoodsSkusDTO)
  @ValidateNested({ each: true })
  goodsSkus: ClientOrderGoodsSkusDTO[];
}

export class ClientOrderIdDTO {
  @ApiProperty({
    required: false,
    description: '订单id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的订单id' })
  id: number;
}

export class ClientOrderListDTO {
  @ApiProperty({
    required: false,
    enum: MerchantOrderListStatusEnum,
    description:
      '订单状态: 10 待付款，20 待发货，30待收货，40已完成，50已取消，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantOrderListStatusEnum)
  status?: MerchantOrderListStatusEnum;

  @ApiProperty({
    type: Number,
    description: '当前页码',
  })
  @Type(() => Number)
  @IsInt({ message: '当前页码必须为数字类型' })
  @Min(1, { message: '当前页码不能少于1' })
  pageIndex? = 1;

  @ApiProperty({
    type: Number,
    description: '每页数量',
  })
  @Type(() => Number)
  @IsInt({ message: '每页数量必须为数字类型' })
  @Max(500, { message: '每页数量不能超过500条' })
  pageSize = 10;
}
