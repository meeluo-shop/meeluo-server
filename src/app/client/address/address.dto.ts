import { ApiProperty } from '@shared/swagger';
import {
  IsMerchantUserDefaultAddressEnum,
  MerchantUserAddressEntity,
} from '@typeorm/meeluoShop';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsMobilePhone,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class ClientAddressInfoDTO extends MerchantUserAddressEntity {
  @ApiProperty({
    description: '省份名称',
  })
  provinceName?: string;

  @ApiProperty({
    description: '城市名称',
  })
  cityName?: string;

  @ApiProperty({
    description: '乡镇名称',
  })
  countyName?: string;
}

export class ClientAddressIdDTO {
  @ApiProperty({
    description: '收货地址id',
  })
  @Type(() => Number)
  @IsInt({ message: '收货地址id必须为数字类型' })
  id: number;
}

export class ClientAddressModifyParamDTO {
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

  @ApiProperty({
    required: false,
    enum: IsMerchantUserDefaultAddressEnum,
    description: '是否为默认收获地址，1是，0否，默认为0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(IsMerchantUserDefaultAddressEnum)
  isDefault: IsMerchantUserDefaultAddressEnum;
}
