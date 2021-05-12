import { Module } from '@nestjs/common';
import { MerchantRechargePlanController } from './plan.controller';
import { MerchantRechargePlanService } from './plan.service';

const providers = [MerchantRechargePlanService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [MerchantRechargePlanController],
})
export class MerchantRechargePlanModule {}
