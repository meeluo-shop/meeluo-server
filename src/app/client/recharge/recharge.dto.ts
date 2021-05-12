import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@shared/swagger';
import {
  MerchantUserBalanceLogSceneEnum,
  MerchantUserBalanceModifyTypeEnum,
} from '@typeorm/meeluoShop';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, MaxLength, Min } from 'class-validator';

export class ClientRechargeParamsDTO {
  @ApiProperty({
    required: false,
    description: '充值套餐id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的充值套餐' })
  planId: number;

  @ApiProperty({
    required: false,
    description: '加密后的自定义的充值金额',
  })
  @IsOptional()
  @MaxLength(100, { message: '无效的充值金额' })
  encryptRechargeAmount: string;
}

export class ClientRechargeBalanceLogListDTO {
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

  @ApiProperty({
    required: false,
    enum: MerchantUserBalanceLogSceneEnum,
    description: '余额变动场景(10用户充值 20用户消费 30管理员操作 40订单退款)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantUserBalanceLogSceneEnum)
  scene: MerchantUserBalanceLogSceneEnum;

  @ApiProperty({
    required: false,
    enum: MerchantUserBalanceModifyTypeEnum,
    description: '变动类型，1增加 2减少',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantUserBalanceModifyTypeEnum)
  type: MerchantUserBalanceModifyTypeEnum;
}

export class ClientRechargeWechatPaySignData {
  @ApiProperty({
    description: '微信公众号appid',
  })
  appId: string;

  @ApiProperty({
    description: '系统生成的订单号',
  })
  orderNo: string;

  @ApiProperty({
    description: '微信支付签名',
  })
  paySign: string;

  @ApiProperty({
    description: '签名算法，暂支持 MD5',
  })
  signType: string;

  @ApiProperty({
    description: '时间戳从1970年1月1日00:00:00至今的秒数,即当前的时间 ',
  })
  timeStamp: string;

  @ApiProperty({
    description: '随机字符串，长度为32个字符以下',
  })
  nonceStr: string;

  @ApiProperty({
    description: '统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=*',
  })
  package: string;
}
