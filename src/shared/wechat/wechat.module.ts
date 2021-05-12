import { Global, Module } from '@nestjs/common';
import { WechatMiniProgramService } from './miniprogram.service';
import { WechatOfficialAccountService } from './official.account.service';
import { WechatPaymentService } from './payment.service';
import { WechatBaseApplicationService } from './base.service';

import { WechatCacheService } from './common';

const providers = [
  WechatCacheService,
  WechatPaymentService,
  WechatMiniProgramService,
  WechatOfficialAccountService,
  WechatBaseApplicationService,
];

@Global()
@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [],
})
export class WechatModule {}
