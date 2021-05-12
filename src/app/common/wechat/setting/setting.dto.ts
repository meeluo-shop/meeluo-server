import { ApiProperty } from '@shared/swagger';
import { IsString, MaxLength } from 'class-validator';

export class WechatOfficialAccountSettingDTO {
  @ApiProperty({
    type: String,
    description: '微信公众号账号',
  })
  @IsString({ message: '请输入正确的微信公众号账号' })
  @MaxLength(50, { message: '微信公众号账号长度不能超过50' })
  wechatId = '';

  @ApiProperty({
    type: String,
    description: '微信公众号appid',
  })
  @IsString({ message: '请输入正确的微信公众号账号' })
  @MaxLength(50, { message: '微信公众号appId长度不能超过50' })
  appId = '';

  @ApiProperty({
    type: String,
    description: '微信公众号appSecrect',
  })
  @IsString({ message: '请输入正确的微信公众号appSecrect' })
  @MaxLength(50, { message: '微信公众号appSecrect长度不能超过50' })
  secret = '';

  @ApiProperty({
    type: String,
    description: '微信公众号服务器token',
  })
  @IsString({ message: '请输入正确的微信公众号token' })
  @MaxLength(50, { message: '微信公众号token长度不能超过50' })
  token = '';
}

export class WechatPaymentSettingDTO {
  @ApiProperty({
    type: String,
    description: '微信支付商户号',
  })
  @IsString({ message: '请输入正确的微信支付商户号' })
  @MaxLength(50, { message: '微信支付商户号长度不能超过50' })
  mchId = '';

  @ApiProperty({
    type: String,
    description: '微信支付密钥',
  })
  @IsString({ message: '请输入正确的微信支付密钥' })
  @MaxLength(50, { message: '微信支付密钥长度不能超过50' })
  apiKey = '';
}
