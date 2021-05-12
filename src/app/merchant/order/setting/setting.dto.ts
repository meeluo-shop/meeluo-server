import { Type } from 'class-transformer';
import { ApiProperty } from '@shared/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class MerchantOrderSettingDTO {
  @ApiProperty({
    required: false,
    type: Number,
    description: '未支付订单，订单下单未付款，n天后自动关闭，设置0天不自动关闭',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '请输入正确的未支付订单自动取消天数' })
  @Min(0, { message: '请输入正确的未支付订单自动取消天数' })
  notPayAutoCancelDay = 3;

  @ApiProperty({
    required: false,
    type: Number,
    description:
      '已发货订单，如果在期间未确认收货，系统自动完成收货，设置0天不自动收货',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '请输入正确的已发货订单自动确认天数' })
  @Min(0, { message: '请输入正确的已发货订单自动确认天数' })
  deliveredAutoSureDay = 15;

  @ApiProperty({
    required: false,
    type: Number,
    description:
      '已完成订单，订单完成后 ，用户在n天内可以发起售后申请，设置0天不允许申请售后',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '请输入正确的已完成订单允许售后天数' })
  @Min(0, { message: '请输入正确的已完成订单允许售后天数' })
  finishAllowServiceDay = 0;
}
