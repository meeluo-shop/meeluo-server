import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class MerchantGamePrizeSettingDTO {
  @ApiProperty({
    description: '奖品有效期（天）',
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: '请输入正确的奖品有效期' })
  @Min(0, { message: '请输入正确的奖品有效期' })
  @Max(30, { message: '奖品有效期最长时间不能超过30天' })
  effectiveTime = 3;

  @ApiProperty({
    description: '每日获奖上限（次），设置0次，则不做限制',
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: '请输入正确的获奖上限次数' })
  @Min(0, { message: '请输入正确的获奖上限次数' })
  @Max(100, { message: '获奖上限次数最多不能超过100次' })
  maxWinningCount = 3;


  @ApiProperty({
    type: Number,
    description:
      '已发货订单，如果在期间未确认收货，系统自动完成收货，设置0天不自动收货',
  })
  @Type(() => Number)
  @IsInt({ message: '请输入正确的已发货订单自动确认天数' })
  @Min(0, { message: '请输入正确的已发货订单自动确认天数' })
  deliveredAutoSureDay = 15;
}
