import { Module } from '@nestjs/common';
import { MerchantRechargeSettingModule } from './setting';
import { MerchantRechargePlanModule } from './plan';

const providers = [];
const modules = [MerchantRechargeSettingModule, MerchantRechargePlanModule];

@Module({
  imports: modules,
  providers,
  exports: [...providers, ...modules],
  controllers: [],
})
export class MerchantRechargeModule {}
