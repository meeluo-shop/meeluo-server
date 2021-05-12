import { Module } from '@nestjs/common';
import { SettingModule } from '@app/common/setting';
import { MerchantSettingService } from './setting.service';

const providers = [MerchantSettingService];

@Module({
  imports: [SettingModule],
  providers,
  exports: providers,
  controllers: [],
})
export class MerchantSettingModule {}
