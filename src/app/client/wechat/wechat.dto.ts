import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum ClientWechatJSSDKIsDebugEnum {
  TRUE = 1,
  FALSE = 0,
}

export class ClientWechatJSSDKConfigDTO {
  debug: boolean;
  beta: boolean;
  timestamp: string;
  url: string;
  signature: string;
  jsApiList: string[];
  openTagList: string[];
  appId: string;
  nonceStr: string;
}

export class ClientWechatJSSDKConfigParamsDTO {
  @ApiProperty({
    description: '当前页面url地址，不包含#后面的参数',
  })
  @IsString()
  @MaxLength(200, { message: 'url地址长度不能超过200' })
  url: string;

  @ApiProperty({
    required: false,
    enum: ClientWechatJSSDKIsDebugEnum,
    description: '是否启用debug，1是，0否。默认0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(ClientWechatJSSDKIsDebugEnum, { message: '错误的debug参数' })
  debug: ClientWechatJSSDKIsDebugEnum = ClientWechatJSSDKIsDebugEnum.FALSE;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'api权限列表',
  })
  @IsOptional()
  @Type(() => String)
  @ArrayMaxSize(500)
  @ArrayMinSize(1, { message: 'api权限列表不能为空' })
  @IsArray({ message: 'api权限列表格式不正确' })
  @IsString({ each: true, message: 'api权限必须为字符串类型' })
  jsApiList: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: '开放标签列表',
  })
  @IsOptional()
  @Type(() => String)
  @ArrayMaxSize(500)
  @ArrayMinSize(1, { message: '开放标签列表不能为空' })
  @IsArray({ message: '开放标签列表格式不正确' })
  @IsString({ each: true, message: '开放标签必须为字符串类型' })
  openTagList: string[];

  @ApiProperty({
    required: false,
    description: '商户id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '商户id必须为数字类型' })
  merchantId?: number;
}
