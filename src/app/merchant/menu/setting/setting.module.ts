import { Module } from '@nestjs/common';
import { MerchantSettingModule } from '@app/merchant/setting';
import { MerchantMenuSettingController } from './setting.controller';
import { MerchantMenuSettingService } from './setting.service';

const providers = [MerchantMenuSettingService];

@Module({
  imports: [MerchantSettingModule],
  providers,
  exports: providers,
  controllers: [MerchantMenuSettingController],
})
export class MerchantMenuSettingModule {}
