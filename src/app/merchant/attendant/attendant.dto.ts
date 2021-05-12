import { IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@shared/swagger';

export class MerchantAttendantDTO {
  @ApiProperty({
    description: '客服名称',
  })
  @MaxLength(50, { message: '客服名称长度不能超过50' })
  name: string;

  @ApiProperty({
    description: '客服微信号二维码',
  })
  @MaxLength(200, { message: '客服头像URL地址长度不能超过200' })
  wechatQrcode: string;

  @ApiProperty({
    description: '客服微信号',
  })
  @MaxLength(100, { message: '微信号长度不能超过100' })
  wechatId: string;

  @ApiProperty({
    required: false,
    description: '客服电话',
  })
  @IsOptional()
  @MaxLength(50, { message: '客服电话长度不能超过50' })
  phone?: string;

  @ApiProperty({
    required: false,
    description: '备注信息',
  })
  @IsOptional()
  @MaxLength(500, { message: '备注信息长度不能超过500' })
  remark?: string;
}
