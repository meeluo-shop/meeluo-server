import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Inject, Get, Query } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantStatisticsService } from './statistics.service';
import {
  MerchantStatisticsBaseCountException,
  MerchantStatisticsSaleVolumeException,
} from './statistics.exception';
import { MerchantStatisticsTimeSlotDTO } from './statistics.dto';

@ApiTags('商户后台数据统计相关接口')
@Controller('merchant/statistics')
export class MerchantStatisticsController {
  constructor(
    @Inject(MerchantStatisticsService)
    private statisticsService: MerchantStatisticsService,
  ) {}

  @Authorize()
  @Get('base_count')
  @ApiOperation({ summary: '获取商家基础数量统计' })
  @ApiErrorResponse(MerchantStatisticsBaseCountException)
  async baseCount(
    @Query() query: MerchantStatisticsTimeSlotDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    return this.statisticsService.getBaseCount(query, merchantId);
  }

  @Authorize()
  @Get('sales_volume')
  @ApiOperation({ summary: '获取商家销售额统计' })
  @ApiErrorResponse(MerchantStatisticsSaleVolumeException)
  async salesVolume(
    @Query() query: MerchantStatisticsTimeSlotDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    return this.statisticsService.getSalesVolume(query, merchantId);
  }
}
