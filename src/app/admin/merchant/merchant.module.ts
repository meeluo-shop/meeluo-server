import { Module } from '@nestjs/common';
import { AdminMerchantController } from './merchant.controller';
import { AdminMerchantService } from './merchant.service';

const providers = [AdminMerchantService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [AdminMerchantController],
})
export class AdminMerchantModule {}
