import { Module } from '@nestjs/common';
import { WechatReplyKeywordModule } from './keyword';
import { WechatReplySubscribeModule } from './subscribe';
import { WechatReplyScanCodeModule } from './scancode';
const providers = [];
const modules = [
  WechatReplySubscribeModule,
  WechatReplyKeywordModule,
  WechatReplyScanCodeModule,
];

@Module({
  imports: [...modules],
  providers,
  exports: providers,
  controllers: [],
})
export class WechatReplyModule {}
