import { ApiProperty } from '@shared/swagger';
import { MaxLength, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import {
  WechatKeywordMsgTypeEnum,
  WechatKeywordIsActiveEnum,
} from '@typeorm/meeluoShop';
import { IsEnum } from '@core/decorator';

export class WechatKeywordListDTO {
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

export class WechatKeywordDTO {
  @ApiProperty({
    description: '关键字',
  })
  @MaxLength(30, { message: '关键字长度不能超过30' })
  keyword: string;

  @ApiProperty({
    enum: WechatKeywordMsgTypeEnum,
    description: '消息类型 10=文字，20=图片，30=音频，40=视频，50=图文',
  })
  @Type(() => Number)
  @IsEnum(WechatKeywordMsgTypeEnum)
  type: WechatKeywordMsgTypeEnum;

  @ApiProperty({
    required: false,
    description: '文字回复内容',
  })
  @IsOptional()
  @MaxLength(2000, { message: '文字回复内容长度不能超过2000' })
  text: string;

  @ApiProperty({
    required: false,
    description: '微信素材id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '微信素材id必须为数字类型' })
  materialId: number;

  @ApiProperty({
    required: false,
    description: '图文标题',
  })
  @IsOptional()
  @MaxLength(50, { message: '图文标题长度不能超过50' })
  title: string;

  @ApiProperty({
    required: false,
    description: '图文描述',
  })
  @IsOptional()
  @MaxLength(100, { message: '图文描述长度不能超过100' })
  introduction: string;

  @ApiProperty({
    required: false,
    description: '图片地址',
  })
  @IsOptional()
  @MaxLength(200, { message: '图片地址长度不能超过200' })
  imageUrl: string;

  @ApiProperty({
    required: false,
    description: '图文链接',
  })
  @IsOptional()
  @MaxLength(200, { message: '图文链接长度不能超过200' })
  linkUrl: string;

  @ApiProperty({
    enum: WechatKeywordIsActiveEnum,
    description: '是否启用，1是 0否',
  })
  @Type(() => Number)
  @IsEnum(WechatKeywordIsActiveEnum)
  isActive: WechatKeywordIsActiveEnum = WechatKeywordIsActiveEnum.TRUE;
}

export class WechatKeywordIdDTO {
  @ApiProperty({
    description: '关键字id',
  })
  @Type(() => Number)
  @IsInt({ each: true, message: '关键字id必须为数字类型' })
  id: number;
}
