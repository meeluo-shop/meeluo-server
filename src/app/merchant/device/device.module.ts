import { Module } from '@nestjs/common';
import { MerchantDevicePrinterModule } from './printer';

const providers = [];
const modules = [MerchantDevicePrinterModule];

@Module({
  imports: modules,
  providers,
  exports: [...providers, ...modules],
  controllers: [],
})
export class MerchantDeviceModule {}
