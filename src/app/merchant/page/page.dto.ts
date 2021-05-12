import { ApiProperty } from '@shared/swagger';
import {
  MaxLength,
  IsInt,
  Min,
  Max,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsEnum } from '@core/decorator';
import { MerchantPageTypeEnum } from '@typeorm/meeluoShop';

export class MerchantModifyPageDTO {
  @ApiProperty({
    description: '页面名称',
  })
  @MaxLength(50, { message: '页面名称长度不能超过50' })
  name: string;

  @ApiProperty({
    required: false,
    enum: MerchantPageTypeEnum,
    description:
      '页面类型，0未使用页面，10首页，20商城页面，30游戏页面，40餐厅页面，默认0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantPageTypeEnum, { message: '错误的页面类型' })
  type: MerchantPageTypeEnum = MerchantPageTypeEnum.NO_TYPE;

  @ApiProperty({
    description: '页面顺序',
  })
  @Type(() => Number)
  @IsInt({ message: '页面顺序必须为数字类型' })
  order: number;

  @ApiProperty({
    type: String,
    description: '页面内容配置',
  })
  @MinLength(1, { message: '页面内容配置不能为空' })
  data: string;
}

export class MerchantSetPageTypeDTO {
  @ApiProperty({
    required: false,
    enum: MerchantPageTypeEnum,
    description: '页面类型，0未使用页面，10首页，20商城页面，30游戏页面，默认0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantPageTypeEnum, { message: '错误的页面类型' })
  type: MerchantPageTypeEnum = MerchantPageTypeEnum.NO_TYPE;
}

export class MerchantPageListDTO {
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

export class MerchantPageIdDTO {
  @ApiProperty({
    description: '页面id',
  })
  @Type(() => Number)
  @IsInt({ message: '页面id必须为数字类型' })
  id: number;
}
