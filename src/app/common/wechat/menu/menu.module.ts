import { Module } from '@nestjs/common';
import { WechatSettingModule } from '../setting';
import { WechatMenuController } from './menu.controller';
import { WechatMenuService } from './menu.service';
import { CommonService } from '@app/common/common.service';
const providers = [CommonService, WechatMenuService];
const modules = [WechatSettingModule];

@Module({
  imports: [...modules],
  providers,
  exports: providers,
  controllers: [WechatMenuController],
})
export class WechatMenuModule {}
