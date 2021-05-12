import { Module } from '@nestjs/common';
import { SettingModule } from '@app/common/setting';
import { WechatSettingModule } from '../../setting';
import { WechatMaterialModule } from '../../material';
import { WechatReplySubscribeController } from './subscribe.controller';
import { WechatReplySubscribeService } from './subscribe.service';
const providers = [WechatReplySubscribeService];
const modules = [SettingModule, WechatSettingModule, WechatMaterialModule];

@Module({
  imports: [...modules],
  providers,
  exports: providers,
  controllers: [WechatReplySubscribeController],
})
export class WechatReplySubscribeModule {}
