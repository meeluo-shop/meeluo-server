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
import { MerchantStaffIsMenuCategoryEnum } from '@typeorm/meeluoShop';
import { ApiProperty } from '@shared/swagger';
import { IsEnum } from '@core/decorator';

export class MerchantUpdateMenuDTO {
  @ApiProperty({
    description: '导航名称',
  })
  @MaxLength(200, { message: '导航名称长度不能超过200' })
  name: string;

  @ApiProperty({
    description: '导航编号',
  })
  @MaxLength(200, { message: '导航编号长度不能超过200' })
  code: string;

  @ApiProperty({
    description: '导航地址',
  })
  @MaxLength(200, { message: '导航地址长度不能超过200' })
  path: string;

  @ApiProperty({
    required: false,
    description: '导航图标',
  })
  @IsOptional()
  @MaxLength(200, { message: '导航图标长度不能超过200' })
  icon?: string;

  @ApiProperty({
    required: false,
    type: Number,
    description: '排序序号，默认100',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '排序序号必须是数字类型' })
  order = 100;

  @ApiProperty({
    required: false,
    description: '导航备注',
  })
  @IsOptional()
  @MaxLength(250, { message: '导航备注长度不能超过250' })
  remark?: string;

  @ApiProperty({
    required: false,
    description: '分类id',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '分类id必须为数字类型' })
  categoryId?: number;

  @ApiProperty({
    required: false,
    description: '上级id',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '上级id必须为数字类型' })
  superiorId?: number;
}

export class MerchantCreateMenuDTO extends MerchantUpdateMenuDTO {
  @ApiProperty({
    enum: MerchantStaffIsMenuCategoryEnum,
    description: '是否是分类',
  })
  @Type(() => Number)
  @IsEnum(MerchantStaffIsMenuCategoryEnum, {
    message: 'isCategory参数格式错误',
  })
  isCategory: MerchantStaffIsMenuCategoryEnum =
    MerchantStaffIsMenuCategoryEnum.FALSE;
}

export class MerchantMenuIdDTO {
  @ApiProperty({
    description: '导航id',
  })
  @Type(() => Number)
  @IsInt({ message: '导航id必须为数字类型' })
  id: number;
}

export class MerchantMenuIdListDTO {
  @ApiProperty({
    type: [Number],
    description: '导航id列表',
  })
  @Type(() => Number)
  @ArrayMaxSize(500)
  @ArrayMinSize(1, { message: '导航id不能为空' })
  @IsArray({ message: '导航id列表格式不正确' })
  @IsInt({ each: true, message: '导航id必须为数字类型' })
  ids: number[];
}

export class MerchantMenuListDTO {
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
    enum: MerchantStaffIsMenuCategoryEnum,
    description: '是否是分类',
  })
  @Type(() => Number)
  @IsEnum(MerchantStaffIsMenuCategoryEnum, {
    message: 'isCategory参数格式错误',
  })
  isCategory: MerchantStaffIsMenuCategoryEnum =
    MerchantStaffIsMenuCategoryEnum.FALSE;

  @ApiProperty({
    required: false,
    description: '导航名称，模糊匹配',
  })
  @IsOptional()
  @MaxLength(200)
  @Transform(val => val || undefined)
  name?: string;

  @ApiProperty({
    required: false,
    description: '导航编号，模糊匹配',
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
