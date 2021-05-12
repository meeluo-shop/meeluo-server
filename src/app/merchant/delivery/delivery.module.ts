import { Module } from '@nestjs/common';
import { MerchantDeliverySettingModule } from './setting';
import { MerchantDeliveryController } from './delivery.controller';
import { MerchantDeliveryService } from './delivery.service';

const providers = [MerchantDeliveryService];
const modules = [MerchantDeliverySettingModule];

@Module({
  imports: [MerchantDeliverySettingModule],
  providers,
  exports: [...providers, ...modules],
  controllers: [MerchantDeliveryController],
})
export class MerchantDeliveryModule {}
