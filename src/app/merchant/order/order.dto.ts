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
} from 'class-validator';

// 订单状态
export enum MerchantOrderListStatusEnum {
  WAIT_PAY = 10,
  WAIT_DELIVERY = 20,
  WAIT_RECEIVE = 30,
  FINISH = 40,
  CANCELED = 50,
  WAIT_CANCELED = 51,
}

export class MerchantOrderIdDTO {
  @ApiProperty({
    required: false,
    description: '订单id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的订单id' })
  id: number;
}

export class MerchantOrderPickUpGoodsDTO {
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

  @ApiProperty({
    description: '发放商品的员工id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的员工id' })
  staffId: number;
}

export class MerchantOrderDeliverGoodsDTO {
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

  @ApiProperty({
    description: '发货的员工id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的员工id' })
  staffId: number;

  @ApiProperty({
    description: '物流公司id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的物流公司id' })
  expressId: number;

  @ApiProperty({
    description: '物流编号',
  })
  @MaxLength(50, { message: '物流编号长度不得超过50' })
  expressNo: string;
}

export class MerchantOrderUpdatePriceDTO {
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

  @ApiProperty({
    description: '运费价格（元）',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的运费价格' },
  )
  @Max(1e8, { message: '运费价格最多不能超过1亿' })
  @Min(0, { message: '请输入正确的运费价格' })
  expressPrice: number;
}

export class MerchantOrderListDTO {
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
