import { MerchantDeliveryCombinationEnum } from './setting.enum';
import { ApiProperty } from '@shared/swagger';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { IsEnum } from '@core/decorator';

export class MerchantDeliverySettingDTO {
  @ApiProperty({
    required: false,
    enum: MerchantDeliveryCombinationEnum,
    description: '运费组合策略',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantDeliveryCombinationEnum)
  combination: MerchantDeliveryCombinationEnum =
    MerchantDeliveryCombinationEnum.TOTAL;
}
