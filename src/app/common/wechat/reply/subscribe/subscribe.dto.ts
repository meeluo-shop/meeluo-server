import { ApiProperty } from '@shared/swagger';
import { MaxLength, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import {
  WechatKeywordMsgTypeEnum,
  WechatKeywordIsActiveEnum,
  WechatMaterialEntity,
} from '@typeorm/meeluoShop';
import { IsEnum } from '@core/decorator';

export class WechatReplySubscribeDTO {
  @ApiProperty({
    enum: WechatKeywordMsgTypeEnum,
    description: '消息类型 10=文字，20=图片，30=音频，40=视频，50=图文',
  })
  @Type(() => Number)
  @IsEnum(WechatKeywordMsgTypeEnum)
  type: WechatKeywordMsgTypeEnum = WechatKeywordMsgTypeEnum.TEXT;

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

export class WechatReplySubscribeResp extends WechatReplySubscribeDTO {
  material: WechatMaterialEntity;
}
