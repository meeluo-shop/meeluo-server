import {
  MaxLength,
  IsOptional,
  IsNumber,
  Max,
  Min,
  IsInt,
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';

export class ModifyMerchantRechargePlanDTO {
  @ApiProperty({
    description: '充值套餐名称',
  })
  @MaxLength(100, { message: '套餐名称长度不能超过100' })
  name: string;

  @ApiProperty({
    description: '充值金额',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的充值金额' },
  )
  @Max(1e8, { message: '充值金额最多不能超过1亿' })
  @Min(0, { message: '请输入正确的充值金额' })
  rechargeAmount: number;

  @ApiProperty({
    description: '赠送金额',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的赠送金额' },
  )
  @Max(1e8, { message: '赠送金额最多不能超过1亿' })
  @Min(0, { message: '请输入正确的赠送金额' })
  donationAmount: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: '套餐顺序',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '请输入正确的顺序' })
  order = 100;
}

export class MerchantRechargePlanListDTO {
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
  @Max(200, { message: '每页数量不能超过200条' })
  pageSize = 15;
}

export class MerchantRechargePlanIdDTO {
  @ApiProperty({
    description: '充值套餐id',
  })
  @Type(() => Number)
  @IsInt({ message: '充值套餐id必须为数字类型' })
  id: number;
}

export class MerchantRechargePlanIdListDTO {
  @ApiProperty({
    type: [Number],
    description: '充值套餐id列表',
  })
  @Type(() => Number)
  @ArrayMaxSize(200)
  @ArrayMinSize(1, { message: '充值套餐id不能为空' })
  @IsArray({ message: '充值套餐id列表格式不正确' })
  @IsInt({ each: true, message: '充值套餐id必须为数字类型' })
  ids: number[];
}
