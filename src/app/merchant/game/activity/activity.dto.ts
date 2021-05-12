import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
  IsOptional,
  IsNumber,
  Max,
  ValidateNested,
} from 'class-validator';
import { IsEnum } from '@core/decorator';
import { MerchantGoodsTypeEnum } from '@typeorm/meeluoShop';

export class MerchantUserGameFreeNumData {
  @ApiProperty({
    description: '免费试玩次数',
  })
  freeNum: number;

  @ApiProperty({
    description: '邀请好友参与游戏可获得的奖励次数',
  })
  invitedFreeNum: number;
}

export class MerchantGamePrizeListDTO {
  @ApiProperty({
    required: false,
    enum: MerchantGoodsTypeEnum,
    description: '奖品类型：10商品 20菜品',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsTypeEnum)
  type?: MerchantGoodsTypeEnum = MerchantGoodsTypeEnum.GOODS;

  @ApiProperty({
    required: false,
    description: '商品id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '商品id必须为数字类型' })
  goodsId: number;

  @ApiProperty({
    type: Number,
    description: '达成分数',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的分数' },
  )
  @Max(1e8, { message: '分数最多不能超过1亿' })
  @Min(0, { message: '请输入正确的分数' })
  score: number;
}

export class MerchantGameActivityDTO {
  @ApiProperty({
    description: '系统后台游戏id',
  })
  @Type(() => Number)
  @IsInt({ message: '系统后台游戏id必须为数字类型' })
  adminGameId: number;

  @ApiProperty({
    type: Number,
    description: '免费试玩次数',
  })
  @Type(() => Number)
  @IsInt({ message: '免费试玩次数必须为数字类型' })
  @Min(0, { message: '请传入有效的免费试玩次数' })
  freeNum = 0;

  @ApiProperty({
    type: Number,
    description: '玩游戏价格（非现实金额）',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的游戏价格' },
  )
  @Max(1e8, { message: '游戏价格最多不能超过1亿' })
  @Min(0, { message: '请输入正确的游戏价格' })
  playPrice = 0;

  @ApiProperty({
    required: false,
    type: Number,
    description: '分享后可获得的免费次数',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '分享奖励次数必须为数字类型' })
  @Min(0, { message: '请传入有效的分享奖励次数' })
  sharedFreeNum: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: '好友邀请奖励次数',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '好友邀请奖励次数必须为数字类型' })
  @Min(0, { message: '请传入有效的好友邀请奖励次数' })
  invitedFreeNum: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: '最多邀请奖励次数',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '好友邀请人数上限为数字类型' })
  @Min(0, { message: '请传入有效的好友邀请人数上限' })
  maxInvitedNum: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: '关注后可获得的免费次数',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '关注奖励次数必须为数字类型' })
  @Min(0, { message: '请传入有效的关注奖励次数' })
  followFreeNum: number;

  @Type(() => MerchantGamePrizeListDTO)
  @ValidateNested({ each: true })
  prizeList: MerchantGamePrizeListDTO[];
}

export class MerchantGameIdDTO {
  @ApiProperty({
    description: '商户游戏活动id',
  })
  @Type(() => Number)
  @IsInt({ message: '商户游戏活动id必须为数字类型' })
  id: number;
}

export class MerchantGameActivityListDTO {
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
