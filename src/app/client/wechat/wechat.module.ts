import { Module } from '@nestjs/common';
import { ClientWechatController } from './wechat.controller';
import { ClientWechatService } from './wechat.service';
import { MerchantWechatModule } from '@app/merchant/wechat';

const providers = [ClientWechatService];

@Module({
  imports: [MerchantWechatModule],
  providers,
  exports: providers,
  controllers: [ClientWechatController],
})
export class ClientWechatModule {}
