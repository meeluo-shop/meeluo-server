import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@shared/swagger';
import {
  MerchantDevicePrinterBrandEnum,
  MerchantDevicePrinterIsActiveEnum,
} from '@typeorm/meeluoShop';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsMobilePhone,
  IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class MerchantDevicePrinterIdDTO {
  @ApiProperty({
    description: '打印机id',
  })
  @Type(() => Number)
  @IsInt({ message: '打印机id必须为数字类型' })
  id: number;
}

export class MerchantDevicePrinterListDTO {
  @ApiProperty({
    required: false,
    enum: MerchantDevicePrinterBrandEnum,
    description: '打印机品牌 (10易联云)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantDevicePrinterBrandEnum)
  brand?: MerchantDevicePrinterBrandEnum;

  @ApiProperty({
    required: false,
    enum: MerchantDevicePrinterIsActiveEnum,
    description: '是否启用，默认启动',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantDevicePrinterIsActiveEnum)
  isActive?: MerchantDevicePrinterIsActiveEnum;

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
  pageSize = 500;
}

export class MerchantDevicePrinterCreateDTO {
  @ApiProperty({
    description: '打印机名称',
  })
  @MaxLength(20, { message: '打印机名称长度不能超过20' })
  name: string;

  @ApiProperty({
    enum: MerchantDevicePrinterBrandEnum,
    description: '打印机品牌 (10易联云)',
  })
  @Type(() => Number)
  @IsEnum(MerchantDevicePrinterBrandEnum)
  brand: MerchantDevicePrinterBrandEnum;

  @ApiProperty({
    description: '打印机编号',
  })
  @MaxLength(50, { message: '打印机编号长度不能超过50' })
  key: string;

  @ApiProperty({
    description: '打印机密钥',
  })
  @MaxLength(50, { message: '打印机密钥长度不能超过50' })
  secret: string;

  @ApiProperty({
    required: false,
    description: '流量卡号码',
  })
  @IsOptional()
  @IsMobilePhone('zh-CN', {}, { message: '错误的手机号码格式' })
  phone: string;

  @ApiProperty({
    required: false,
    type: Number,
    description: '自动打印份数',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '打印份数必须为数字类型' })
  printCount = 1;

  @ApiProperty({
    enum: MerchantDevicePrinterIsActiveEnum,
    description: '是否启用，默认启动',
  })
  @Type(() => Number)
  @IsEnum(MerchantDevicePrinterIsActiveEnum)
  isActive: MerchantDevicePrinterIsActiveEnum =
    MerchantDevicePrinterIsActiveEnum.TRUE;
}
