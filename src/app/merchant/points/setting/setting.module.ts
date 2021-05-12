import { Module } from '@nestjs/common';
import { MerchantSettingModule } from '@app/merchant/setting';
import { MerchantPointsSettingController } from './setting.controller';
import { MerchantPointsSettingService } from './setting.service';

const providers = [MerchantPointsSettingService];

@Module({
  imports: [MerchantSettingModule],
  providers,
  exports: providers,
  controllers: [MerchantPointsSettingController],
})
export class MerchantPointsSettingModule {}
