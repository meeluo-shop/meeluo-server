import { ApiProperty } from '@shared/swagger';
import {
  MaxLength,
  IsOptional,
  IsNumber,
  Max,
  Min,
  IsInt,
  IsDate,
} from 'class-validator';
import {
  MerchantCouponIsUsedEnum,
  MerchantCouponColorEnum,
  MerchantCouponTypeEnum,
  MerchantCouponExpireTypeEnum,
} from '@typeorm/meeluoShop';
import { Type, Transform } from 'class-transformer';
import { IsEnum } from '@core/decorator';

export enum MerchantCouponGrantIsAvailableEnum {
  TRUE = 1,
  FALSE = 0,
}

export class MerchantCouponDTO {
  @ApiProperty({
    description: '优惠券名称',
  })
  @MaxLength(200, { message: '优惠券名称长度不能超过200' })
  name: string;

  @ApiProperty({
    enum: MerchantCouponColorEnum,
    description: '优惠券颜色，10红，20蓝，30黄，40绿，50紫',
  })
  @Type(() => Number)
  @IsEnum(MerchantCouponColorEnum)
  color: MerchantCouponColorEnum;

  @ApiProperty({
    enum: MerchantCouponTypeEnum,
    description: '优惠券类型，10满减券，20折扣券',
  })
  @Type(() => Number)
  @IsEnum(MerchantCouponTypeEnum)
  type: MerchantCouponTypeEnum;

  @ApiProperty({
    required: false,
    description: '满减券-满减金额（元）',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的满减金额' },
  )
  @Max(1e8, { message: '满减金额最多不能超过1亿' })
  @Min(0, { message: '请输入正确的满减金额' })
  reducePrice: number;

  @ApiProperty({
    required: false,
    description: '折扣券-折扣率（0-100）',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: '折扣率最少不能低于0' })
  @Max(100, { message: '折扣率最多不能超过100' })
  discount: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: '最低消费金额（元）',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的最低消费金额' },
  )
  @Max(1e8, { message: '最低消费金额最多不能超过1亿' })
  @Min(0, { message: '请输入正确的最低消费金额' })
  minPrice = 0;

  @ApiProperty({
    enum: MerchantCouponExpireTypeEnum,
    description: '有效期类型，10领取后生效，20固定时间段',
  })
  @Type(() => Number)
  @IsEnum(MerchantCouponExpireTypeEnum)
  expireType: MerchantCouponExpireTypeEnum;

  @ApiProperty({
    required: false,
    description: '领取后生效-有效天数',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '有效天数必须为数字类型' })
  @Min(0, { message: '请输入正确的有效天数' })
  expireDay: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: '固定时间段-开始时间',
  })
  @IsOptional()
  @Type(() => Number)
  @IsDate({ message: '请输入正确的有效期开始时间' })
  @Transform(val => new Date(val), { toClassOnly: true })
  startTime: Date;

  @ApiProperty({
    required: false,
    type: Number,
    description: '固定时间段-结束时间',
  })
  @IsOptional()
  @Type(() => Number)
  @IsDate({ message: '请输入正确的有效期结束时间' })
  @Transform(val => new Date(val), { toClassOnly: true })
  endTime: Date;

  @ApiProperty({
    required: false,
    type: Number,
    description: '优惠券顺序',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '优惠券顺序必须为数字类型' })
  order = 100;
}

export class MerchantCouponIdDTO {
  @ApiProperty({
    description: '优惠券id',
  })
  @Type(() => Number)
  @IsInt({ message: '优惠券id必须为数字类型' })
  id: number;
}

export class MerchantCouponListDTO {
  @ApiProperty({
    required: false,
    enum: MerchantCouponColorEnum,
    description: '优惠券颜色，10红，20蓝，30黄，40绿，50紫，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantCouponColorEnum)
  color?: MerchantCouponColorEnum;

  @ApiProperty({
    required: false,
    enum: MerchantCouponTypeEnum,
    description: '优惠券类型，10满减券，20折扣券，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantCouponTypeEnum)
  type?: MerchantCouponTypeEnum;

  @ApiProperty({
    required: false,
    enum: MerchantCouponExpireTypeEnum,
    description: '有效期类型，10领取后生效，20固定时间段，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantCouponExpireTypeEnum)
  expireType?: MerchantCouponExpireTypeEnum;

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
  @Max(500, { message: '每页数量不能超过500条' })
  pageSize = 15;
}

export class MerchantCouponGrantListDTO extends MerchantCouponListDTO {
  @ApiProperty({
    required: false,
    description: '优惠券id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '优惠券id必须为数字类型' })
  couponId?: number;

  @ApiProperty({
    required: false,
    description: '用户id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '用户id必须为数字类型' })
  merchantUserId?: number;

  @ApiProperty({
    required: false,
    enum: MerchantCouponIsUsedEnum,
    description: '是否已使用，1是，0否，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantCouponIsUsedEnum)
  isUsed?: MerchantCouponIsUsedEnum;

  @ApiProperty({
    required: false,
    enum: MerchantCouponGrantIsAvailableEnum,
    description:
      '是否未过期，1是，0否，不传查询所有（必须传入expire_type字段，否则不生效）',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantCouponGrantIsAvailableEnum)
  isAvailable?: MerchantCouponGrantIsAvailableEnum;
}

export class MerchantCouponGrantUserDTO {
  @ApiProperty({
    description: '优惠券id',
  })
  @Type(() => Number)
  @IsInt({ message: '优惠券id必须为数字类型' })
  couponId: number;

  @ApiProperty({
    description: '用户id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的用户id' })
  merchantUserId: number;

  @ApiProperty({
    type: Number,
    description: '发放数量',
  })
  @Type(() => Number)
  @IsInt({ message: '错误的发放数量' })
  @Max(200, { message: '发放数量最多不能超过200张' })
  grantNum = 1;
}
