import { Module } from '@nestjs/common';
import { MerchantWechatService } from './wechat.service';
import { WechatSettingModule } from '@app/common/wechat/setting';
import { WechatQRCodeModule } from '@app/common/wechat/qrcode';
import { WechatTemplateModule } from '@app/common/wechat/template';
import { MerchantWechatTemplateService } from './template';
import {
  MerchantWechatQRCodeController,
  MerchantWechatQRCodeService,
} from './qrcode';

const providers = [
  MerchantWechatTemplateService,
  MerchantWechatQRCodeService,
  MerchantWechatService,
];
const modules = [WechatSettingModule, WechatTemplateModule, WechatQRCodeModule];

@Module({
  imports: [...modules],
  providers,
  exports: [...modules, ...providers],
  controllers: [MerchantWechatQRCodeController],
})
export class MerchantWechatModule {}
