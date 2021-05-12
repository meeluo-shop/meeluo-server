import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@nestjs/swagger';
import { MerchantUserPointsModifyTypeEnum } from '@typeorm/meeluoShop';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Max, MaxLength, Min } from 'class-validator';

export class MerchantPointsListDTO {
  @ApiProperty({
    required: false,
    description: '用户id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '无效的用户id' })
  userId?: number;

  @ApiProperty({
    required: false,
    enum: MerchantUserPointsModifyTypeEnum,
    description: '变动类型，1增加 2减少',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantUserPointsModifyTypeEnum)
  type: MerchantUserPointsModifyTypeEnum;

  @ApiProperty({
    required: false,
    description: '用户昵称，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50, { message: '用户昵称不能超过50' })
  nickname: string;

  @ApiProperty({
    required: false,
    type: Number,
    description: '起始时间（时间戳）',
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(val => new Date(val), { toClassOnly: true })
  startTime?: Date;

  @ApiProperty({
    required: false,
    type: Number,
    description: '结束时间（时间戳）',
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
