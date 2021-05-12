import { ApiProperty } from '@shared/swagger';
import { MaxLength, IsOptional, IsInt, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class ModifyMerchantDTO {
  @ApiProperty({
    description: '门店名称',
  })
  @MaxLength(50, { message: '门店名称长度不能超过50' })
  storeName: string;

  @ApiProperty({
    required: false,
    description: '门店图标',
  })
  @IsOptional()
  @MaxLength(500, { message: '门店图标长度不能超过500' })
  logo: string;

  @ApiProperty({
    required: false,
    description: '门头照片',
  })
  @IsOptional()
  @MaxLength(500, { message: '门头照片长度不能超过500' })
  doorPhoto: string;

  @ApiProperty({
    required: false,
    description: '门店描述',
  })
  @IsOptional()
  @MaxLength(500, { message: '门店描述长度不能超过500' })
  storeDesc?: string;

  @ApiProperty({
    required: false,
    description: '联系人',
  })
  @IsOptional()
  @MaxLength(20, { message: '联系人长度不能超过20' })
  liaison?: string;

  @ApiProperty({
    description: '联系电话',
  })
  @MaxLength(20, { message: '联系电话长度不能超过20' })
  phone: string;

  @ApiProperty({
    required: false,
    description: '所在地址',
  })
  @IsOptional()
  @MaxLength(500, { message: '所在地址长度不能超过500' })
  address?: string;

  @ApiProperty({
    required: false,
    description: '省份编号',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '省份编号必须为数字类型' })
  provinceCode?: number;

  @ApiProperty({
    required: false,
    description: '城市编号',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '城市编号必须为数字类型' })
  cityCode?: number;

  @ApiProperty({
    required: false,
    description: '县市区编号',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '县市区编号必须为数字类型' })
  countyCode?: number;

  @ApiProperty({
    required: false,
    description: '经度',
  })
  @IsOptional()
  @IsNumberString({}, { message: '错误的经度格式' })
  @MaxLength(50, { message: '经度长度不能超过50' })
  longitude: string;

  @ApiProperty({
    required: false,
    description: '纬度',
  })
  @IsOptional()
  @IsNumberString({}, { message: '错误的纬度格式' })
  @MaxLength(50, { message: '纬度长度不能超过50' })
  latitude: string;
}
