import { ApiProperty } from '@shared/swagger';
import { MaxLength, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ModifyMerchantAddressDTO {
  @ApiProperty({
    description: '收货人姓名',
  })
  @MaxLength(50, { message: '收货人姓名长度不能超过50' })
  name: string;

  @ApiProperty({
    description: '收货人电话',
  })
  @MaxLength(50, { message: '收货人电话长度不能超过50' })
  phone: string;

  @ApiProperty({
    description: '收货人详细地址',
  })
  @MaxLength(200, { message: '收货人详细地址长度不能超过200' })
  detail: string;
}

export class MerchantAddressListDTO {
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

export class MerchantAddressIdDTO {
  @ApiProperty({
    description: '退货地址id',
  })
  @Type(() => Number)
  @IsInt({ message: '退货地址id必须为数字类型' })
  id: number;
}
