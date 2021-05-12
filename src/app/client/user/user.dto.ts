import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsMobilePhone, IsNumber, MaxLength } from 'class-validator';

export class ClientUserSendPhoneCodeDTO {
  @ApiProperty({
    description: '手机号',
  })
  @IsMobilePhone('zh-CN', {}, { message: '错误的手机号码格式' })
  phone: string;
}

export class ClientUserVerifyPhoneCodeDTO {
  @ApiProperty({
    description: '手机号',
  })
  @IsMobilePhone('zh-CN', {}, { message: '错误的手机号码格式' })
  phone: string;

  @ApiProperty({
    description: '验证码',
  })
  @MaxLength(20, { message: '错误的验证码格式' })
  code: string;
}

export class ClientUserSubtractBalanceDTO {
  @ApiProperty({
    description: '加密后的用户id',
  })
  @MaxLength(200, { message: '错误的用户id' })
  encryptedId: string;

  @ApiProperty({
    description: '扣款金额',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的扣款金额' },
  )
  amount: number;
}

export class ClientUserIdDTO {
  @ApiProperty({
    description: '商户用户id',
  })
  @Type(() => Number)
  @IsInt({ message: '错误的用户id' })
  id: number;
}

export class ClientUserOrderCountDTO {
  @ApiProperty({
    description: '待领取的获奖记录数量',
  })
  noReceivedWinningCount: number;

  @ApiProperty({
    description: '用户所有的订单数量',
  })
  allOrderCount: number;

  @ApiProperty({
    description: '未付款的商城订单数量',
  })
  noPaidOrderCount: number;

  @ApiProperty({
    description: '未付款的点餐订单数量',
  })
  noPaidMenuOrderCount: number;
}
