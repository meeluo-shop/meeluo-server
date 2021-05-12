import { ApiProperty } from '@shared/swagger';
import {
  MaxLength,
  IsInt,
  IsOptional,
  ValidateNested,
  IsNumber,
  Min,
  ArrayMaxSize,
  IsArray,
  IsString,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AdminGameIsWinningEnum } from '@typeorm/meeluoShop';
import { IsEnum } from '@core/decorator';

export class AdminGameDifficultyDTO {
  @ApiProperty({
    description: '游戏难度名称，如：（普通人级别、大神级别）',
  })
  @MaxLength(50, { message: '游戏难度名称长度不能超过50' })
  name: string;

  @ApiProperty({
    required: false,
    description: '游戏难度描述',
  })
  @IsOptional()
  @MaxLength(1000, { message: '游戏难度描述长度不能超过1000' })
  remark: string;

  @ApiProperty({
    required: false,
    description: '分数范围（低）',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的分数范围（低）' },
  )
  @Min(0, { message: '分数范围（低）最低不能小于0' })
  minScore: number;

  @ApiProperty({
    required: false,
    description: '分数范围（高）',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的分数范围（高）' },
  )
  @Min(0, { message: '分数范围（高）最低不能小于0' })
  maxScore: number;
}

export class AdminGameIdDTO {
  @ApiProperty({
    description: '游戏id',
  })
  @Type(() => Number)
  @IsInt({ message: '游戏id必须为数字类型' })
  id: number;
}

export class AdminGameInfoDTO {
  @ApiProperty({
    description: '游戏名称',
  })
  @MaxLength(50, { message: '游戏长度不能超过50' })
  name: string;

  @ApiProperty({
    description: 'h5游戏url地址',
  })
  @MaxLength(500, { message: '游戏url地址长度不能超过500' })
  gameUrl: string;

  @ApiProperty({
    description: '游戏缩略图id',
  })
  @Type(() => Number)
  @IsInt({ message: '游戏缩略图id必须为数字类型' })
  thumbnailId: number;

  @ApiProperty({
    description: '游戏分类id',
  })
  @Type(() => Number)
  @IsInt({ message: '游戏分类id必须为数字类型' })
  categoryId: number;

  @ApiProperty({
    description: '游戏描述',
  })
  @MaxLength(1000, { message: '游戏描述长度不能超过1000' })
  description: string;

  @ApiProperty({
    description: '游戏获奖单位，如（分/米/次）',
  })
  @MaxLength(20, { message: '游戏获奖单位长度不能超过29' })
  unit: string;

  @ApiProperty({
    description: '游戏规则介绍',
  })
  @IsString()
  rule: string;

  @ApiProperty({
    required: false,
    enum: AdminGameIsWinningEnum,
    description: '是否是赢奖游戏(1是 0否)，默认0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AdminGameIsWinningEnum)
  isWinning: AdminGameIsWinningEnum = AdminGameIsWinningEnum.FALSE;
}

export class ModifyAdminGameDTO {
  @Type(() => AdminGameInfoDTO)
  @ValidateNested()
  game: AdminGameInfoDTO;

  @Type(() => AdminGameDifficultyDTO)
  @ValidateNested({ each: true })
  difficulty?: AdminGameDifficultyDTO[];

  @ApiProperty({
    required: false,
    type: [Number],
    description: '游戏截图id列表',
  })
  @IsOptional()
  @Type(() => Number)
  @ArrayMaxSize(20, { message: '游戏截图数量不能超过20' })
  @IsArray({ message: '游戏截图id列表格式不正确' })
  @IsInt({ each: true, message: '游戏截图id必须为数字类型' })
  imageIds?: number[];
}

export class AdminGameListDTO {
  @ApiProperty({
    required: false,
    description: '游戏分类id，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '游戏分类id必须为数字类型' })
  categoryId?: number;

  @ApiProperty({
    required: false,
    enum: AdminGameIsWinningEnum,
    description: '是否为赢奖游戏，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AdminGameIsWinningEnum)
  isWinning?: AdminGameIsWinningEnum;

  @ApiProperty({
    required: false,
    description: '游戏名称，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50)
  @Transform(val => val || undefined)
  name?: string;

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
  pageSize? = 15;
}
