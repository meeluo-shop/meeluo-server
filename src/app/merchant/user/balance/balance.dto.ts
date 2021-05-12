import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@nestjs/swagger';
import {
  MerchantUserBalanceLogSceneEnum,
  MerchantUserBalanceModifyTypeEnum,
} from '@typeorm/meeluoShop';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class MerchantUserBalanceModifyDTO {
  @ApiProperty({
    description: '用户id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的用户id' })
  userId: number;

  @ApiProperty({
    type: Number,
    description: '操作的金额（元）',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的金额' },
  )
  @Max(1e8, { message: '金额最多不能超过1亿' })
  @Min(0, { message: '请输入正确的金额' })
  money: number;

  @ApiProperty({
    enum: MerchantUserBalanceLogSceneEnum,
    description: '变动类型，1增加 2减少',
  })
  @Type(() => Number)
  @IsEnum(MerchantUserBalanceModifyTypeEnum)
  type: MerchantUserBalanceModifyTypeEnum;

  @ApiProperty({
    enum: MerchantUserBalanceLogSceneEnum,
    description: '余额变动场景(10用户充值 20用户消费 30管理员操作 40订单退款)',
  })
  @Type(() => Number)
  @IsEnum(MerchantUserBalanceLogSceneEnum)
  scene: MerchantUserBalanceLogSceneEnum;

  @ApiProperty({
    required: false,
    description: '管理员备注',
  })
  @IsOptional()
  @MaxLength(50, { message: '备注长度不能超过50' })
  remark: string;
}

export class MerchantUserBalanceListDTO {
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
    enum: MerchantUserBalanceLogSceneEnum,
    description:
      '余额变动场景: 10用户充值，20用户消费，30管理员操作，40订单退款，50用户充值套餐赠送，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantUserBalanceLogSceneEnum)
  scene?: MerchantUserBalanceLogSceneEnum;

  @ApiProperty({
    required: false,
    enum: MerchantUserBalanceModifyTypeEnum,
    description: '变动类型，1增加 2减少',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantUserBalanceModifyTypeEnum)
  type: MerchantUserBalanceModifyTypeEnum;

  @ApiProperty({
    required: false,
    description: '用户昵称，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50, { message: '用户昵称不能超过50' })
  nickname: string;

  @ApiProperty({
    required: false,
    type: Number,
    description: '起始时间（时间戳）',
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(val => new Date(val), { toClassOnly: true })
  startTime?: Date;

  @ApiProperty({
    required: false,
    type: Number,
    description: '结束时间（时间戳）',
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
