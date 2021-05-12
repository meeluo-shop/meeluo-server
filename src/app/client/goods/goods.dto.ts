import { MerchantGoodsOrderTypeEnum } from '@app/merchant/goods';
import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@shared/swagger';
import {
  MerchantGoodsEntity,
  MerchantGoodsIsActiveEnum,
  MerchantGoodsTypeEnum,
} from '@typeorm/meeluoShop';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  ArrayMaxSize,
  IsArray,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class ClientGamePrizeListParamsDTO {
  @ApiProperty({
    required: false,
    type: Number,
    description: '游戏id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的游戏id' })
  gameId?: number;

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
  @Max(1000, { message: '每页数量不能超过1000条' })
  pageSize = 15;
}

export class ClientGoodsListDTO {
  @ApiProperty({
    required: false,
    description: '商品分类id，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '商品分类id必须为数字类型' })
  categoryId?: number;

  @ApiProperty({
    required: false,
    enum: MerchantGoodsTypeEnum,
    description: '商品类型，10 商品 20 菜品，默认10',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsTypeEnum)
  type?: MerchantGoodsTypeEnum;

  @ApiProperty({
    required: false,
    description: '商品名称，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50)
  @Transform(val => val || undefined)
  name?: string;

  @ApiProperty({
    required: false,
    enum: MerchantGoodsIsActiveEnum,
    description: '是否上架，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsIsActiveEnum)
  isActive?: MerchantGoodsIsActiveEnum;

  @ApiProperty({
    type: Number,
    description: '当前页码',
  })
  @Type(() => Number)
  @IsInt({ message: '当前页码必须为数字类型' })
  @Min(1, { message: '当前页码不能少于1' })
  pageIndex? = 1;

  @ApiProperty({
    type: Number,
    description: '每页数量',
  })
  @Type(() => Number)
  @IsInt({ message: '每页数量必须为数字类型' })
  @Max(500, { message: '每页数量不能超过500条' })
  pageSize = 15;

  @ApiProperty({
    required: false,
    enum: MerchantGoodsOrderTypeEnum,
    description:
      '商品排序方式，10综合排序，20销量排序，30价格从高到低，40价格从低到高，50上架时间排序',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsOrderTypeEnum)
  orderType?: MerchantGoodsOrderTypeEnum = MerchantGoodsOrderTypeEnum.DEFAULT;
}

export class ClientGoodsIdsDTO {
  @ApiProperty({
    required: false,
    type: [Number],
    description: '指定商品id列表',
  })
  @Type(() => Number)
  @IsOptional()
  @ArrayMaxSize(500)
  @IsArray({ message: '商品id列表格式不正确' })
  @IsInt({ each: true, message: '商品id必须为数字类型' })
  ids: number[];
}

export class ClientGoodsPrizeListRespDTO extends MerchantGoodsEntity {
  @ApiProperty({
    type: Number,
    description: '游戏id',
  })
  gameId: number;

  @ApiProperty({
    type: Number,
    description: '游戏获奖分数',
  })
  prizeScore: number;
}

export class ClientGoodsIdDTO {
  @ApiProperty({
    description: '商品id',
  })
  @Type(() => Number)
  @IsInt({ message: '商品id必须为数字类型' })
  id: number;
}
