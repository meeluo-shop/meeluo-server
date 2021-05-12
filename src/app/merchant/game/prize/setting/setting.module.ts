import { Module } from '@nestjs/common';
import { MerchantSettingModule } from '@app/merchant/setting';
import { MerchantGamePrizeSettingController } from './setting.controller';
import { MerchantGamePrizeSettingService } from './setting.service';

const providers = [MerchantGamePrizeSettingService];

@Module({
  imports: [MerchantSettingModule],
  providers,
  exports: providers,
  controllers: [MerchantGamePrizeSettingController],
})
export class MerchantGamePrizeSettingModule {}
