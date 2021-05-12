import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { MerchantMenuPayTypeEnum } from '../setting';

// 订单状态
export enum MerchantMenuOrderListStatusEnum {
  WAIT_PAY = 10, // 待支付
  WAIT_COLLECT = 11, // 待收款
  WAIT_DELIVERY = 20, // 待上餐
  WAIT_RECEIVE = 30, // 待完成
  FINISH = 40, // 已完成
  CANCELED = 50, // 已取消
  WAIT_CANCELED = 51, // 待取消
}

export class MerchantMenuOrderIdDTO {
  @ApiProperty({
    required: false,
    description: '订单id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的订单id' })
  id: number;
}

export class MerchantMenuOrderServingDTO {
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

export class MerchantMenuOrderUpdatePriceDTO {
  @ApiProperty({
    description: '修改后的价格（元）',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的修改价格' },
  )
  @Max(1e8, { message: '修改价格最多不能超过1亿' })
  @Min(0.0, { message: '请输入正确的修改价格' })
  price: number;
}

export class MerchantMenuOrderListDTO {
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
    required: false,
    description: '订单号（模糊匹配）',
  })
  @IsOptional()
  @MaxLength(50, { message: '订单号长度不能超过50' })
  orderNo?: string;

  @ApiProperty({
    required: false,
    description: '用户id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的用户id' })
  userId?: number;

  @ApiProperty({
    required: false,
    description: '餐桌id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的餐桌id' })
  tableId?: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: '订单起始时间（时间戳）',
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(val => new Date(val), { toClassOnly: true })
  startTime?: Date;

  @ApiProperty({
    required: false,
    type: Number,
    description: '订单结束时间（时间戳）',
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(val => new Date(val), { toClassOnly: true })
  endTime?: Date;

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
  pageSize = 15;
}

export class MerchantMenuOrderGoodsSkusDTO {
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

export class MerchantMenuOrderSubmitDTO {
  @ApiProperty({
    enum: MerchantMenuPayTypeEnum,
    description: '支付方式：10 前台支付 20 余额支付, 30 餐后支付',
  })
  @Type(() => Number)
  @IsEnum(MerchantMenuPayTypeEnum)
  payType: MerchantMenuPayTypeEnum;

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
    description: '用户id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的用户id' })
  userId?: number;
}
