import { Module } from '@nestjs/common';
import { MerchantDevicePrinterController } from './printer.controller';
import { MerchantDevicePrinterService } from './printer.service';

const providers = [MerchantDevicePrinterService];
const modules = [];

@Module({
  imports: [],
  providers,
  exports: [...providers, ...modules],
  controllers: [MerchantDevicePrinterController],
})
export class MerchantDevicePrinterModule {}
