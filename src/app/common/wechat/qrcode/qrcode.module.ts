import { Module } from '@nestjs/common';
import { CommonService } from '../../common.service';
import { WechatSettingModule } from '../setting/setting.module';
import { WechatQRCodeService } from './qrcode.service';

const providers = [CommonService, WechatQRCodeService];
const modules = [WechatSettingModule];

@Module({
  imports: [...modules],
  providers,
  exports: [...providers],
  controllers: [],
})
export class WechatQRCodeModule {}
