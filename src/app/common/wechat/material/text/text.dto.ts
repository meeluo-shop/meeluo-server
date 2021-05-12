import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsString,
  MaxLength,
  IsOptional,
  IsInt,
  ArrayMaxSize,
  IsArray,
} from 'class-validator';

export class WechatMaterialTextInfoDTO {
  @ApiProperty({
    description: '文章标题',
  })
  @IsString({ message: '错误的文章标题' })
  @MaxLength(50, { message: '标题长度不能超过50' })
  title: string;

  @ApiProperty({
    required: false,
    description: '文章作者',
  })
  @IsOptional()
  @IsString({ message: '错误的文章作者' })
  @MaxLength(50, { message: '作者长度不能超过50' })
  author: string;

  @ApiProperty({
    description: '封面图片资源id',
  })
  @Type(() => Number)
  @IsInt({ message: '封面图片资源id必须为数字类型' })
  resourceId: number;

  @ApiProperty({
    required: false,
    description: '文章摘要',
  })
  @IsOptional()
  @IsString({ message: '错误的文章摘要' })
  @MaxLength(150, { message: '文章摘要长度不能超过150' })
  digest: string;

  @ApiProperty({
    description: '文章正文',
  })
  @IsString({ message: '错误的文章正文' })
  content: string;
}

export class WechatMaterialTextDTO {
  @ApiProperty({
    description: '素材集名称',
  })
  @IsString({ message: '错误素材名称' })
  @MaxLength(50, { message: '素材名称长度不能超过50' })
  name: string;

  @Type(() => WechatMaterialTextInfoDTO)
  @ValidateNested()
  textList: WechatMaterialTextInfoDTO[];

  @ApiProperty({
    required: false,
    type: [Number],
    description: '正文中的图片id列表',
  })
  @IsOptional()
  @Type(() => Number)
  @ArrayMaxSize(200, { message: '正文中图片数量不得超过200' })
  @IsArray({ message: '图片id列表格式不正确' })
  @IsInt({ each: true, message: '图片id必须为数字类型' })
  imageIds: number[] = [];
}
