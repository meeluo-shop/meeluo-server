import { Module } from '@nestjs/common';
import { MerchantGameModule } from '@app/merchant/game';
import { MerchantTableModule } from '@app/merchant/table';
import { CommonService } from '../../common.service';
import { WechatSettingModule } from '../setting';
import { WechatTemplateModule } from '../template';
import { WechatReplyScanCodeModule } from '../reply/scancode';
import { WechatReplySubscribeModule } from '../reply/subscribe';
import { WechatCallbackController } from './callback.controller';
import { WechatCallbackService } from './callback.service';
import { MerchantWechatModule } from '@app/merchant/wechat';

const providers = [CommonService, WechatCallbackService];
const modules = [
  MerchantTableModule,
  MerchantGameModule,
  MerchantWechatModule,
  WechatReplyScanCodeModule,
  WechatReplySubscribeModule,
  WechatTemplateModule,
  WechatSettingModule,
];

@Module({
  imports: [...modules],
  providers,
  exports: providers,
  controllers: [WechatCallbackController],
})
export class WechatCallbackModule {}
