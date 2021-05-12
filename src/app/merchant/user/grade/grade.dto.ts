import {
  MaxLength,
  IsInt,
  Max,
  Min,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import { IsMerchantUserDefaultGradeEnum } from '@typeorm/meeluoShop';
import { IsEnum } from '@core/decorator';

export class ModifyMerchantUserGradeDTO {
  @ApiProperty({
    description: '用户等级名称',
  })
  @MaxLength(50, { message: '用户等级名称长度不能超过50' })
  name: string;

  @ApiProperty({
    description: '用户等级权重',
  })
  @Type(() => Number)
  @Min(0, { message: '用户等级权重不能低于0' })
  @Max(100, { message: '用户等级权重最大不能超过100' })
  @IsInt({ message: '用户等级权重必须为数字类型' })
  weight: number;

  @ApiProperty({
    required: false,
    enum: IsMerchantUserDefaultGradeEnum,
    description: '是否为默认等级（只能有一个），1是，0否，默认0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(IsMerchantUserDefaultGradeEnum)
  isDefault: IsMerchantUserDefaultGradeEnum =
    IsMerchantUserDefaultGradeEnum.FALSE;

  @ApiProperty({
    description: '升级所需金额，用户的实际消费金额满n元后，自动升级',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的金额' },
  )
  @Max(1e8, { message: '升级所需金额最多不能超过1亿' })
  @Min(0, { message: '请输入正确的金额' })
  upgrade: number;

  @ApiProperty({
    type: Number,
    description: '等级权益(折扣率0-100)，0表示无折扣',
  })
  @Type(() => Number)
  @IsInt({ message: '请输入正确的等级权益' })
  @Max(100, { message: '等级权益最高不能超过100' })
  @Min(0, { message: '等级权益最低不能低于0' })
  equity = 0;
}

export class MerchantUserGradeIdDTO {
  @ApiProperty({
    description: '用户会员等级id',
  })
  @Type(() => Number)
  @IsInt({ message: '用户会员等级id必须为数字类型' })
  id: number;
}

export class MerchantUserGradeListDTO {
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
  pageSize = 15;
}
