import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@shared/swagger';
import { MerchantGameWinningStatusEnum } from '@typeorm/meeluoShop';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Max, MaxLength, Min } from 'class-validator';

export class MerchantWinningListParamsDTO {
  @ApiProperty({
    required: false,
    enum: MerchantGameWinningStatusEnum,
    description:
      '是否领取，10待领取，20待发货，30已发货，40已领取，99已过期。默认10',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGameWinningStatusEnum)
  status?: MerchantGameWinningStatusEnum;

  @ApiProperty({
    type: Number,
    description: '当前页码',
  })
  @Type(() => Number)
  @IsInt({ message: '当前页码必须为数字类型' })
  @Min(1, { message: '当前页码不能少于1' })
  pageIndex = 1;

  @ApiProperty({
    type: Number,
    description: '每页数量',
  })
  @Type(() => Number)
  @IsInt({ message: '每页数量必须为数字类型' })
  @Max(100, { message: '每页数量不能超过100条' })
  pageSize = 15;

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
}

export class MerchantWinningDetailParamsDTO {
  @ApiProperty({
    description: '获奖记录id',
  })
  @Type(() => Number)
  @IsInt({ message: '获奖记录id必须为数字类型' })
  id: number;
}

export class MerchantWinningDeliverPrizeDTO {
  @ApiProperty({
    description: '订单id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的订单id' })
  winningId: number;

  @ApiProperty({
    description: '发货的员工id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的员工id' })
  staffId: number;

  @ApiProperty({
    required: false,
    description: '物流公司id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的物流公司id' })
  expressId?: number;

  @ApiProperty({
    required: false,
    description: '物流编号',
  })
  @IsOptional()
  @MaxLength(50, { message: '物流编号长度不得超过50' })
  expressNo?: string;
}
