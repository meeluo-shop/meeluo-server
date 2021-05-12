import { ApiProperty } from '@shared/swagger';
import {
  MaxLength,
  IsInt,
  IsOptional,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MerchantTableStatusEnum } from '@typeorm/meeluoShop';
import { IsEnum } from '@core/decorator';

export class MerchantTableModifyDTO {
  @ApiProperty({
    description: '餐桌名称',
  })
  @MaxLength(50, { message: '餐桌名称长度不能超过50' })
  name: string;

  @ApiProperty({
    description: '餐桌序号',
  })
  @Type(() => Number)
  @IsInt({ message: '餐桌序号必须为数字类型' })
  order: number;

  @ApiProperty({
    description: '容纳人数',
  })
  @Type(() => Number)
  @IsInt({ message: '请输入正确的容纳人数' })
  people: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: '最低消费',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的最低消费金额' },
  )
  @Max(1e8, { message: '请输入正确的最低消费金额' })
  @Min(0, { message: '请输入正确的最低消费金额' })
  minConsumeFee: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: '餐具调料费/人',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的餐具调料费' },
  )
  @Max(1e8, { message: '请输入正确的餐具调料费' })
  @Min(0, { message: '请输入正确的餐具调料费' })
  wareFee: number;
}

export class MerchantTableIdDTO {
  @ApiProperty({
    description: '餐桌id',
  })
  @Type(() => Number)
  @IsInt({ message: '餐桌id必须为数字类型' })
  id: number;
}

export class MerchantTableListDTO {
  @ApiProperty({
    required: false,
    enum: MerchantTableStatusEnum,
    description: '餐桌状态，10 闲 20 忙',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantTableStatusEnum)
  status?: MerchantTableStatusEnum;

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
  pageSize = 500;
}
