import { Module } from '@nestjs/common';
import { MerchantTableController } from './table.controller';
import { MerchantTableService } from './table.service';
import { MerchantDevicePrinterModule } from '../device/printer';
import { MerchantWechatModule } from '@app/merchant/wechat/wechat.module';

const providers = [MerchantTableService];

@Module({
  imports: [MerchantWechatModule, MerchantDevicePrinterModule],
  providers,
  exports: providers,
  controllers: [MerchantTableController],
})
export class MerchantTableModule {}
