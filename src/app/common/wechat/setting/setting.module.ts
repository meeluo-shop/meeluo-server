import { Module } from '@nestjs/common';
import { SettingModule } from '@app/common/setting';
import { WechatSettingController } from './setting.controller';
import { WechatSettingService } from './setting.service';
import { CommonService } from '../../common.service';

const providers = [CommonService, WechatSettingService];

@Module({
  imports: [SettingModule],
  providers,
  exports: providers,
  controllers: [WechatSettingController],
})
export class WechatSettingModule {}
