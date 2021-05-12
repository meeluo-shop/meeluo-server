import { Module } from '@nestjs/common';
import { WechatSettingModule } from './setting';
import { WechatTemplateModule } from './template';
import { WechatQRCodeModule } from './qrcode';
import { WechatMaterialModule } from './material';
import { WechatCallbackModule } from './callback';
import { WechatReplyModule } from './reply';
import { WechatMenuModule } from './menu';

const providers = [];
const modules = [
  WechatMaterialModule,
  WechatCallbackModule,
  WechatSettingModule,
  WechatTemplateModule,
  WechatQRCodeModule,
  WechatReplyModule,
  WechatMenuModule,
];

@Module({
  imports: [...modules],
  providers,
  exports: [...modules, ...providers],
  controllers: [],
})
export class WechatModule {}
