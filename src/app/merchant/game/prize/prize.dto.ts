import { ApiProperty } from '@shared/swagger';
import { MerchantGoodsTypeEnum } from '@typeorm/meeluoShop';
import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsEnum, IsOptional } from 'class-validator';

export class MerchantGamePrizeListParamsDTO {
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

  @ApiProperty({
    required: false,
    enum: MerchantGoodsTypeEnum,
    description: '奖品类型，10商品，20菜品',
  })
  @Type(() => Number)
  @IsOptional()
  @IsEnum(MerchantGoodsTypeEnum)
  type?: MerchantGoodsTypeEnum;

  @ApiProperty({
    required: false,
    type: Number,
    description: '游戏id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的游戏id' })
  gameId?: number;
}
