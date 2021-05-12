import { MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import { IsEnum } from '@core/decorator';
import {
  AllowCustomAmountEnum,
  AllowAutoMatchSetMealEnum,
} from './setting.enum';

export class MerchantRechargeSettingDTO {
  @ApiProperty({
    required: false,
    enum: AllowCustomAmountEnum,
    description: '是否允许自定义金额',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AllowCustomAmountEnum)
  allowCustomAmount: AllowCustomAmountEnum = AllowCustomAmountEnum.FALSE;

  @ApiProperty({
    required: false,
    enum: AllowAutoMatchSetMealEnum,
    description: '是否允许自动匹配套餐',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AllowAutoMatchSetMealEnum)
  allowAutoMatchSetMeal: AllowAutoMatchSetMealEnum =
    AllowAutoMatchSetMealEnum.TRUE;

  @ApiProperty({
    required: false,
    type: String,
    description: '充值说明',
  })
  @IsOptional()
  @MaxLength(1000, { message: '充值说明长度不能超过1000' })
  recharge =
    '1. 账户充值仅限微信在线支付方式，充值金额实时到账;\n2. 账户充值套餐赠送的金额即时到账;\n3. 账户余额有效期：自充值日起至用完即止;\n4. 如有其他疑问，可拨打客服电话;';
}
