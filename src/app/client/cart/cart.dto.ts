import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, MaxLength } from 'class-validator';

export class ClientCartAddDTO {
  @ApiProperty({
    description: '商品id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的商品id' })
  goodsId: number;

  @ApiProperty({
    description: '商品数量',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的商品数量' })
  goodsNum: number;

  @ApiProperty({
    required: false,
    description: '商品sku记录索引 (由多个规格id拼接组成)',
  })
  @Type(() => String)
  @IsOptional()
  @MaxLength(200)
  specSkuId: string;
}

export class ClientCartDeleteDTO {
  @ApiProperty({
    description: '商品id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的商品id' })
  goodsId: number;

  @ApiProperty({
    required: false,
    description: '商品sku记录索引 (由多个规格id拼接组成)',
  })
  @Type(() => String)
  @IsOptional()
  @MaxLength(200)
  specSkuId: string;
}
