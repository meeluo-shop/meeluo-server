import { Type } from 'class-transformer';
import { ApiProperty } from '@shared/swagger';
import { IsInt, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';

export class MerchantPointsSettingDTO {
  @ApiProperty({
    required: false,
    type: Number,
    description: '积分赠送数额，如：1元可转换10积分，0为不赠送',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '积分赠送数额必须为数字类型' })
  @Min(0, { message: '请输入正确的积分赠送数额' })
  giftRatio = 0;

  @ApiProperty({
    required: false,
    type: Number,
    description: '积分抵扣数额，如：1个积分可抵扣0.01元，0为不抵扣',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的积分抵扣数额' },
  )
  @IsOptional()
  @Min(0, { message: '请输入正确的积分抵扣数额' })
  discountRatio = 0;

  @ApiProperty({
    required: false,
    type: String,
    description: '积分说明',
  })
  @IsOptional()
  @MaxLength(1000, { message: '积分说明长度不能超过1000' })
  remark =
    '1.积分不可兑现、不可转让,仅可在本平台使用;\n2.您在本平台参加特定活动也可使用积分,详细使用规则以具体活动时的规则为准;\n3.积分的数值精确到个位(小数点后全部舍弃,不进行四舍五入)\n4.买家在完成该笔交易(订单状态为“已签收”)后才能得到此笔交易的相应积分,如购买商品参加店铺其他优惠,则优惠的金额部分不享受积分获取;';
}
