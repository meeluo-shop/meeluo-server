import { Module } from '@nestjs/common';
import { SettingModule } from '@app/common/setting';
import { WechatMaterialModule } from '../../material';
import { WechatReplyScanCodeController } from './scancode.controller';
import { WechatReplyScanCodeService } from './scancode.service';
import { CommonService } from '@app/common/common.service';

const providers = [CommonService, WechatReplyScanCodeService];
const modules = [SettingModule, WechatMaterialModule];

@Module({
  imports: [...modules],
  providers,
  exports: providers,
  controllers: [WechatReplyScanCodeController],
})
export class WechatReplyScanCodeModule {}
