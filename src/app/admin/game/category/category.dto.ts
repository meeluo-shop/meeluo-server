import { ApiProperty } from '@shared/swagger';
import { MaxLength, IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ModifyAdminGameCategoryDTO {
  @ApiProperty({
    description: '分类名称',
  })
  @MaxLength(50, { message: '分类名称长度不能超过50' })
  name: string;

  @ApiProperty({
    description: '分类序号',
  })
  @Type(() => Number)
  @IsInt({ message: '分类序号必须为数字类型' })
  order: number;

  @ApiProperty({
    required: false,
    description: '图片资源id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '图片资源id必须为数字类型' })
  imageId: number;

  @ApiProperty({
    required: false,
    description: '上级分类id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '上级分类id必须为数字类型' })
  superiorId: number;
}

export class AdminGameCategoryIdDTO {
  @ApiProperty({
    description: '游戏分类id',
  })
  @Type(() => Number)
  @IsInt({ message: '游戏分类id必须为数字类型' })
  id: number;
}

export class AdminGameCategoryListDTO {
  @ApiProperty({
    required: false,
    description: '上级分类id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '上级分类id必须为数字类型' })
  superiorId: number;

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
