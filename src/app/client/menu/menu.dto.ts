import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  MerchantMenuOrderPayTypeEnum,
  MerchantMenuOrderEntity,
} from '@typeorm/meeluoShop';
import {
  MerchantMenuOrderListStatusEnum,
  MerchantMenuOrderGoodsSkusDTO,
} from '@app/merchant/menu/order';
import { MerchantMenuPayTypeEnum } from '@app/merchant/menu/setting';

// 是否使用积分抵扣
export enum ClientMenuOrderIsUsePointsEnum {
  TRUE = 1,
  FALSE = 0,
}

export class ClientMenuOrderPaymentDTO {
  @ApiProperty({
    enum: MerchantMenuOrderPayTypeEnum,
    description: '支付方式：10 微信支付 20 余额支付',
  })
  @Type(() => Number)
  @IsEnum(MerchantMenuOrderPayTypeEnum)
  payType: MerchantMenuOrderPayTypeEnum;
}

export class ClientMenuOrderPaySignData {
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

export class ClientMenuOrderSubmitRespDTO {
  order: MerchantMenuOrderEntity;
  paySignData?: ClientMenuOrderPaySignData;
}

export class ClientMenuOrderSubmitDTO {
  @ApiProperty({
    enum: ClientMenuOrderIsUsePointsEnum,
    description: '是否使用积分抵扣：1 是 0 否',
  })
  @Type(() => Number)
  @IsEnum(ClientMenuOrderIsUsePointsEnum)
  usePointsDiscount: ClientMenuOrderIsUsePointsEnum;

  @ApiProperty({
    enum: MerchantMenuPayTypeEnum,
    description: '支付方式：10 微信支付 20 余额支付, 30 线下支付',
  })
  @Type(() => Number)
  @IsEnum(MerchantMenuPayTypeEnum)
  payType: MerchantMenuPayTypeEnum;

  @ApiProperty({
    required: false,
    description: '买家留言，选填',
  })
  @IsOptional()
  @MaxLength(50, { message: '留言长度不能超过50' })
  remark: string;

  @Type(() => MerchantMenuOrderGoodsSkusDTO)
  @ValidateNested({ each: true })
  goodsSkus: MerchantMenuOrderGoodsSkusDTO[];

  @ApiProperty({
    description: '餐桌id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的餐桌id' })
  tableId: number;

  @ApiProperty({
    description: '就餐人数',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的就餐人数' })
  people: number;

  @ApiProperty({
    required: false,
    description: '优惠券id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的优惠券id' })
  couponId?: number;
}

export class ClientMenuOrderIdDTO {
  @ApiProperty({
    required: false,
    description: '订单id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的订单id' })
  id: number;
}

export class ClientMenuOrderListDTO {
  @ApiProperty({
    required: false,
    enum: MerchantMenuOrderListStatusEnum,
    description:
      '订单状态: 10 待付款，11 待收款 20 待上餐，30待完成，40已完成，50已取消，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantMenuOrderListStatusEnum)
  status?: MerchantMenuOrderListStatusEnum;

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
