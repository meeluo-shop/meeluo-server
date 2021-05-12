import { MerchantCouponGrantIsAvailableEnum } from '@app/merchant/coupon';
import { ApiProperty } from '@shared/swagger';
import {
  MerchantCouponExpireTypeEnum,
  MerchantCouponIsUsedEnum,
  MerchantCouponTypeEnum,
} from '@typeorm/meeluoShop';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ClientCouponGrantListDTO {
  @ApiProperty({
    required: false,
    enum: MerchantCouponIsUsedEnum,
    description: '是否已使用，1是，0否，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantCouponIsUsedEnum)
  isUsed: MerchantCouponIsUsedEnum;

  @ApiProperty({
    required: false,
    enum: MerchantCouponGrantIsAvailableEnum,
    description:
      '是否未过期，1是，0否，不传查询所有（必须传入expire_type字段，否则不生效）',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantCouponGrantIsAvailableEnum)
  isAvailable: MerchantCouponGrantIsAvailableEnum;

  @ApiProperty({
    required: false,
    enum: MerchantCouponTypeEnum,
    description: '优惠券类型，10满减券，20折扣券，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantCouponTypeEnum)
  type: MerchantCouponTypeEnum;

  @ApiProperty({
    required: false,
    enum: MerchantCouponExpireTypeEnum,
    description: '有效期类型，10领取后生效，20固定时间段，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantCouponExpireTypeEnum)
  expireType: MerchantCouponExpireTypeEnum;

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
  pageSize = 20;
}
