import { Module } from '@nestjs/common';
import { MerchantSettingModule } from '@app/merchant/setting';
import { MerchantDeliverySettingController } from './setting.controller';
import { MerchantDeliverySettingService } from './setting.service';

const providers = [MerchantDeliverySettingService];

@Module({
  imports: [MerchantSettingModule],
  providers,
  exports: providers,
  controllers: [MerchantDeliverySettingController],
})
export class MerchantDeliverySettingModule {}
