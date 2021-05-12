import { Module } from '@nestjs/common';
import { MerchantStatisticsController } from './statistics.controller';
import { MerchantStatisticsService } from './statistics.service';

const providers = [MerchantStatisticsService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [MerchantStatisticsController],
})
export class MerchantStatisticsModule {}
