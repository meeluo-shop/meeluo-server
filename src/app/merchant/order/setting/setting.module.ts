import { Module } from '@nestjs/common';
import { MerchantSettingModule } from '@app/merchant/setting';
import { MerchantOrderSettingController } from './setting.controller';
import { MerchantOrderSettingService } from './setting.service';

const providers = [MerchantOrderSettingService];

@Module({
  imports: [MerchantSettingModule],
  providers,
  exports: providers,
  controllers: [MerchantOrderSettingController],
})
export class MerchantOrderSettingModule {}
