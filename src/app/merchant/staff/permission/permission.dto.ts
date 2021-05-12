import { Type, Transform } from 'class-transformer';
import {
  Min,
  Max,
  IsOptional,
  MaxLength,
  IsInt,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { MerchantStaffIsPermCategoryEnum } from '@typeorm/meeluoShop';
import { ApiProperty } from '@shared/swagger';
import { IsEnum } from '@core/decorator';

export class MerchantPermIdDTO {
  @ApiProperty({
    description: '权限id',
  })
  @Type(() => Number)
  @IsInt({ message: '权限id必须为数字类型' })
  id: number;
}

export class MerchantPermIdListDTO {
  @ApiProperty({
    type: [Number],
    description: '权限id列表',
  })
  @Type(() => Number)
  @ArrayMaxSize(500)
  @ArrayMinSize(1, { message: '权限id不能为空' })
  @IsArray({ message: '权限id列表格式不正确' })
  @IsInt({ each: true, message: '权限id必须为数字类型' })
  ids: number[];
}

export class MerchantPermListDTO {
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

  @ApiProperty({
    enum: MerchantStaffIsPermCategoryEnum,
    description: '是否是分类',
  })
  @Type(() => Number)
  @IsEnum(MerchantStaffIsPermCategoryEnum, {
    message: 'isCategory参数格式错误',
  })
  isCategory: MerchantStaffIsPermCategoryEnum =
    MerchantStaffIsPermCategoryEnum.FALSE;

  @ApiProperty({
    required: false,
    description: '权限名称，模糊匹配',
  })
  @IsOptional()
  @MaxLength(200)
  @Transform(val => val || undefined)
  name?: string;

  @ApiProperty({
    required: false,
    description: '权限编号，模糊匹配',
  })
  @IsOptional()
  @MaxLength(200)
  @Transform(val => val || undefined)
  code?: string;

  @ApiProperty({
    required: false,
    description: '分类id，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '分类id必须为数字类型' })
  categoryId?: number;
}
