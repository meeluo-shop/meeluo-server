import { ApiProperty } from '@shared/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class MerchantStatisticsTimeSlotDTO {
  @ApiProperty({
    required: false,
    type: Number,
    description: '固定时间段-开始时间',
  })
  @IsOptional()
  @Type(() => Number)
  @IsDate({ message: '请输入正确的有效期开始时间' })
  @Transform(val => new Date(val), { toClassOnly: true })
  startTime?: Date;

  @ApiProperty({
    required: false,
    type: Number,
    description: '固定时间段-结束时间',
  })
  @IsOptional()
  @Type(() => Number)
  @IsDate({ message: '请输入正确的有效期结束时间' })
  @Transform(val => new Date(val), { toClassOnly: true })
  endTime?: Date;
}

export class MerchantStatisticsSaleVolumeItemDTO {
  days: string;
  sum: number;
}

export class MerchantStatisticsBaseCountRespDTO {
  userCount: number;
  winningCount: number;
  orderCount: number;
  menuOrderCount: number;
  goodsCount: number;
}

export class MerchantStatisticsSaleVolumeRespDTO {
  orderSalesVolume: MerchantStatisticsSaleVolumeItemDTO[];
  menuOrderSalesVolume: MerchantStatisticsSaleVolumeItemDTO[];
  gameOrderSalesVolume: MerchantStatisticsSaleVolumeItemDTO[];
}
