import { AdminGameListDTO } from '@app/admin/game';
import { ApiProperty } from '@shared/swagger';
import {
  MerchantGameInviteIsNewUserEnum,
  MerchantGameInviteStatusEnum,
  MerchantGameIsActiveEnum,
  MerchantGameOrderPayTypeEnum,
} from '@typeorm/meeluoShop';
import {
  IsOptional,
  IsInt,
  MaxLength,
  IsString,
  IsArray,
  ArrayMaxSize,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsEnum } from '@core/decorator';

export class ModifyMerchantGameInfoDTO {
  @ApiProperty({
    description: '游戏名称（商家自定义）',
  })
  @MaxLength(50, { message: '游戏长度不能超过50' })
  name: string;

  @ApiProperty({
    description: '游戏描述（商家自定义）',
  })
  @MaxLength(1000, { message: '游戏描述长度不能超过1000' })
  description: string;

  @ApiProperty({
    description: '游戏规则介绍',
  })
  @IsString()
  rule: string;

  @ApiProperty({
    required: false,
    enum: MerchantGameIsActiveEnum,
    description: '是否启用，1是，0否',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGameIsActiveEnum, { message: '错误的启用状态' })
  isActive: MerchantGameIsActiveEnum = MerchantGameIsActiveEnum.TRUE;
}

export class MerchantGameIdsDTO {
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

export class MerchantGameIdDTO {
  @ApiProperty({
    description: '商户游戏活动id',
  })
  @Type(() => Number)
  @IsInt({ message: '商户游戏活动id必须为数字类型' })
  id: number;
}

export class MerchantGameActiveDTO {
  @ApiProperty({
    required: false,
    enum: MerchantGameIsActiveEnum,
    description: '是否启用，1是，0否',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGameIsActiveEnum, { message: '错误的启用状态' })
  isActive: MerchantGameIsActiveEnum = MerchantGameIsActiveEnum.TRUE;
}

export class MerchantGameListDTO extends AdminGameListDTO {
  @ApiProperty({
    required: false,
    enum: MerchantGameIsActiveEnum,
    description: '是否启用，1是 0否',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGameIsActiveEnum)
  isActive: MerchantGameIsActiveEnum;
}

export class MerchantGameBaseListDTO {
  @ApiProperty({
    required: false,
    description: '游戏id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的游戏id' })
  adminGameId?: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: '订单起始时间（时间戳）',
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(val => new Date(val), { toClassOnly: true })
  startTime?: Date;

  @ApiProperty({
    required: false,
    type: Number,
    description: '订单结束时间（时间戳）',
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(val => new Date(val), { toClassOnly: true })
  endTime?: Date;

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
}

export class MerchantGameOrderListDTO extends MerchantGameBaseListDTO {
  @ApiProperty({
    required: false,
    enum: MerchantGameOrderPayTypeEnum,
    description: '支付方式(0未支付 10微信支付 20余额支付)，默认0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGameOrderPayTypeEnum)
  payType: MerchantGameOrderPayTypeEnum;
}

export class MerchantGameInviteListDTO extends MerchantGameBaseListDTO {
  @ApiProperty({
    required: false,
    enum: MerchantGameInviteStatusEnum,
    description: '邀请用户是否成功获得奖励(1是 0否)，默认1',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGameInviteStatusEnum)
  status?: MerchantGameInviteStatusEnum;

  @ApiProperty({
    required: false,
    enum: MerchantGameInviteIsNewUserEnum,
    description: '被邀请的是否是新用户(1是 0否)，默认0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGameInviteIsNewUserEnum)
  isNewUser?: MerchantGameInviteIsNewUserEnum;

  @ApiProperty({
    required: false,
    description: '邀请人用户id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的用户id' })
  inviteUserId?: number;
}
