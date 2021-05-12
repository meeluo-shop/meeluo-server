import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@shared/swagger';
import {
  AdminGameEntity,
  MerchantGameOrderPayTypeEnum,
  MerchantGamePrizeEntity,
  MerchantGameRankingEntity,
  MerchantGameWinningEntity,
  MerchantGameInviteIsNewUserEnum,
} from '@typeorm/meeluoShop';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  ArrayMaxSize,
  IsArray,
  MaxLength,
  MinLength,
  Max,
} from 'class-validator';
import { ClientRechargeWechatPaySignData } from '../recharge/recharge.dto';
import { MerchantUserGameFreeNumData } from '@app/merchant/game';

export class ClientGameIdDTO {
  @ApiProperty({
    description: '游戏id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的游戏id' })
  id: number;
}

export class ClientGameInviteRewardDTO {
  @ApiProperty({
    description: '游戏id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的游戏id' })
  adminGameId: number;

  @ApiProperty({
    description: '邀请用户id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的邀请用户id' })
  inviteUserId: number;

  @ApiProperty({
    required: false,
    enum: MerchantGameInviteIsNewUserEnum,
    description: '是否是新用户，1是 0否',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGameInviteIsNewUserEnum)
  isNewUser: MerchantGameInviteIsNewUserEnum =
    MerchantGameInviteIsNewUserEnum.FALSE;
}

export class ClientGameOrderIdDTO {
  @ApiProperty({
    description: '游戏订单id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的游戏订单id' })
  orderId: number;
}

export class ClientGameCheckSessionDTO {
  @ApiProperty({
    description: '游戏id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的游戏id' })
  gameId: number;

  @ApiProperty({
    description: '用户id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的用户id' })
  userId: number;

  @ApiProperty({
    description: '商户id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的商户id' })
  merchantId: number;
}

export class ClientGameIdsDTO {
  @ApiProperty({
    required: false,
    type: [Number],
    description: '指定游戏id列表',
  })
  @Type(() => Number)
  @IsOptional()
  @ArrayMaxSize(500)
  @IsArray({ message: '游戏id列表格式不正确' })
  @IsInt({ each: true, message: '游戏id必须为数字类型' })
  ids: number[];
}

export class ClientGameListByPrizeDTO {
  @ApiProperty({
    description: '奖品id',
  })
  @Type(() => Number)
  @IsInt({ message: '奖品id必须为数字类型' })
  prizeId: number;
}

export class ClientGameListByPrizeResp extends AdminGameEntity {
  @ApiProperty({
    type: MerchantGamePrizeEntity,
    description: '游戏奖品',
  })
  prize: MerchantGamePrizeEntity;
}

export class ClientGameOverDTO {
  @ApiProperty({
    description: '加密后的游戏挑战分数',
  })
  @MaxLength(200, { message: '无效的挑战分数' })
  score: string;

  @ApiProperty({
    required: false,
    description: '加密后的游戏挑战分数',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的游戏订单' })
  orderId: number;
}

export class ClientGameLeaveWordDTO {
  @ApiProperty({
    description: '系统游戏id',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的游戏id' })
  adminGameId: number;

  @ApiProperty({
    description: '用户留言',
  })
  @MinLength(1, { message: '留言不能为空' })
  @MaxLength(20, { message: '留言长度不能超过20个字' })
  leaveWord: string;
}

export class ClientGameOverRespDTO {
  @ApiProperty({
    description: '游戏分数排名',
  })
  ranking: number;

  @ApiProperty({
    description: '当前挑战分数',
  })
  score: number;

  @ApiProperty({
    description: '历史最高分数',
  })
  maxScore: number;

  @ApiProperty({
    description: '游戏信息',
  })
  gameInfo: AdminGameEntity;

  @ApiProperty({
    description: '游戏挑战记录id',
  })
  recordId: number;

  @ApiProperty({
    description: '游戏挑战记录id',
  })
  winning?: MerchantGameWinningEntity;
}

export class ClientGamePlayGameResp extends MerchantUserGameFreeNumData {
  paySignData?: ClientRechargeWechatPaySignData;
}

export class ClientGameGetRankingDTO {
  @ApiProperty({
    type: Number,
    description: '查询的记录数量',
  })
  @Type(() => Number)
  @IsInt({ message: '记录数量必须为数字类型' })
  @Max(100, { message: '记录数量最多不能超过100条' })
  number = 10;
}

export class ClientGameScoreRankingRespDTO extends MerchantGameRankingEntity {
  @ApiProperty({
    type: Number,
    description: '分数排名',
  })
  rankingNumber?: number;
}

export class ClientGameSignDTO {
  @ApiProperty({
    enum: MerchantGameOrderPayTypeEnum,
    description: '支付方式(0未支付 10微信支付 20余额支付)，默认0',
  })
  @Type(() => Number)
  @IsEnum(MerchantGameOrderPayTypeEnum)
  payType: MerchantGameOrderPayTypeEnum;

  @ApiProperty({
    description: '验证签名',
  })
  @MaxLength(250, { message: '无效的签名' })
  sign: string;

  @ApiProperty({
    type: Number,
    description: '时间戳。毫秒',
  })
  @Type(() => Number)
  @IsInt({ message: '无效的时间戳格式' })
  timestamp: number;
}
