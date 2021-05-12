import { Module } from '@nestjs/common';
import { MerchantMenuOrderModule } from './order';
import { MerchantMenuSettingModule } from './setting';

const providers = [MerchantMenuOrderModule, MerchantMenuSettingModule];

@Module({
  imports: providers,
  providers,
  exports: providers,
  controllers: [],
})
export class MerchantMenuModule {}
