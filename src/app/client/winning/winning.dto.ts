import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsMobilePhone, MaxLength } from 'class-validator';

export class ClientWinningRemindDeliveryParamDTO {
  @ApiProperty({
    description: '收货人姓名',
  })
  @MaxLength(50, { message: '收货人姓名长度不能超过50' })
  name: string;

  @ApiProperty({
    description: '手机号',
  })
  @IsMobilePhone('zh-CN', {}, { message: '错误的手机号码格式' })
  phone: string;

  @ApiProperty({
    description: '省份编号',
  })
  @Type(() => Number)
  @IsInt({ message: '省份编号必须为数字类型' })
  provinceCode: number;

  @ApiProperty({
    description: '城市编号',
  })
  @Type(() => Number)
  @IsInt({ message: '城市编号必须为数字类型' })
  cityCode: number;

  @ApiProperty({
    description: '县市区编号',
  })
  @Type(() => Number)
  @IsInt({ message: '县市区编号必须为数字类型' })
  countyCode: number;

  @ApiProperty({
    description: '详细收货地址',
  })
  @MaxLength(200, { message: '收货地址长度不能超过200' })
  address: string;
}
