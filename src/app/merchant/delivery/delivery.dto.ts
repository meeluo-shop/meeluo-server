import { ApiProperty } from '@shared/swagger';
import {
  MaxLength,
  IsOptional,
  IsInt,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { MerchantDeliveryMethodEnum } from '@typeorm/meeluoShop';
import { Type } from 'class-transformer';
import { IsEnum } from '@core/decorator';

export class MerchantDeliveryRuleDTO {
  @ApiProperty({
    description: '可配送区域(城市id集)',
  })
  @IsNotEmpty({ message: '可配送区域不能为空' })
  regions: string;

  @ApiProperty({
    description: '首件(个)/首重(Kg)',
  })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  first: number;

  @ApiProperty({
    description: '运费',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的运费' },
  )
  firstFee: number;

  @ApiProperty({
    description: '续件/续重',
  })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  additional: number;

  @ApiProperty({
    description: '续费(元',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的续费' },
  )
  additionalFee: number;
}

export class ModifyMerchantDeliveryDTO {
  @ApiProperty({
    description: '配送模板名称',
  })
  @MaxLength(100, { message: '配送模板名称长度不能超过100' })
  name: string;

  @ApiProperty({
    required: false,
    enum: MerchantDeliveryMethodEnum,
    description: '计费方式(10按件数 20按重量)，默认10',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantDeliveryMethodEnum)
  method: MerchantDeliveryMethodEnum = MerchantDeliveryMethodEnum.PIECE;

  @ApiProperty({
    description: '模板序号',
  })
  @Type(() => Number)
  @IsInt({ message: '模板序号必须为数字类型' })
  order: number;

  @Type(() => MerchantDeliveryRuleDTO)
  @ValidateNested({ each: true })
  @ArrayMaxSize(200)
  @ArrayMinSize(1, { message: '配送模板规则不能为空' })
  rules: MerchantDeliveryRuleDTO[];
}

export class MerchantDeliveryIdDTO {
  @ApiProperty({
    description: '运费模板id',
  })
  @Type(() => Number)
  @IsInt({ message: '运费模板id必须为数字类型' })
  id: number;
}

export class MerchantDeliveryListDTO {
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
