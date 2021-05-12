import { Module } from '@nestjs/common';
import { MerchantSettingModule } from '@app/merchant/setting';
import { MerchantPageSettingService } from './setting.service';

const providers = [MerchantPageSettingService];

@Module({
  imports: [MerchantSettingModule],
  providers,
  exports: providers,
  controllers: [],
})
export class MerchantPageSettingModule {}
