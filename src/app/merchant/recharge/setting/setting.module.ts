import { Module } from '@nestjs/common';
import { MerchantSettingModule } from '@app/merchant/setting';
import { MerchantRechargeSettingController } from './setting.controller';
import { MerchantRechargeSettingService } from './setting.service';

const providers = [MerchantRechargeSettingService];

@Module({
  imports: [MerchantSettingModule],
  providers,
  exports: providers,
  controllers: [MerchantRechargeSettingController],
})
export class MerchantRechargeSettingModule {}
