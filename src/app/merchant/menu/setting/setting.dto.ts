import { Type } from 'class-transformer';
import { ApiProperty } from '@shared/swagger';
import { IsArray, IsInt, IsOptional, Min } from 'class-validator';
import { MerchantMenuOrderPayTypeEnum } from '@typeorm/meeluoShop';
import { IsEnum } from '@core/decorator';

export enum MerchantMenuPayTypeEnum {
  WECHAT = MerchantMenuOrderPayTypeEnum.WECHAT,
  BALANCE = MerchantMenuOrderPayTypeEnum.BALANCE,
  OFFLINE = 99,
}

export class MerchantMenuPayTypeSettingDTO {
  @ApiProperty({
    enum: MerchantMenuPayTypeEnum,
    type: [MerchantMenuPayTypeEnum],
    description: '商家点餐支付方式列表，例：[10, 20]',
  })
  @Type(() => Number)
  @IsArray({ message: '支付方式列表格式不正确' })
  @IsEnum(MerchantMenuPayTypeEnum, { each: true, message: '错误的支付方式' })
  payTypeList: MerchantMenuPayTypeEnum[] = [
    MerchantMenuPayTypeEnum.BALANCE,
    MerchantMenuPayTypeEnum.WECHAT,
    MerchantMenuPayTypeEnum.OFFLINE,
  ];
}

export class MerchantMenuOrderSettingDTO {
  @ApiProperty({
    required: false,
    type: Number,
    description:
      '未支付订单，订单下单未付款，n分钟后自动关闭，设置0不自动关闭。单位：分钟',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '请输入正确的未支付订单自动取消时间' })
  @Min(0, { message: '请输入正确的未支付订单自动取消时间' })
  notPayAutoCancelMin = 60;

  @ApiProperty({
    required: false,
    type: Number,
    description:
      '已支付或餐后支付的订单提交后，超过n小时为主动处理，则自动设置为完成，设置0不自动。单位：小时',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '请输入正确的订单自动完成时间' })
  @Min(0, { message: '请输入正确的订单自动完成时间' })
  finishedAutoSureHour = 24;
}
