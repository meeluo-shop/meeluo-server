import { Module } from '@nestjs/common';
import { MerchantModule } from '@app/merchant/merchant.module';
import { MerchantWechatModule } from '@app/merchant/wechat';
import { ClientWechatModule } from '../wechat/wechat.module';
import { ClientMerchantController } from './merchant.controller';
import { ClientMerchantService } from './merchant.service';

const providers = [ClientMerchantService];

@Module({
  imports: [MerchantModule, MerchantWechatModule, ClientWechatModule],
  providers,
  exports: providers,
  controllers: [ClientMerchantController],
})
export class ClientMerchantModule {}
