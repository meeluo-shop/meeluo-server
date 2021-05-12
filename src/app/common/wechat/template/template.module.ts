import { Module } from '@nestjs/common';
import { WechatSettingModule } from '../setting';
import { WechatTemplateController } from './template.controller';
import { WechatTemplateService } from './template.service';
import { CommonService } from '@app/common/common.service';

const providers = [WechatTemplateService, CommonService];
const modules = [WechatSettingModule];

@Module({
  imports: [...modules],
  providers,
  exports: [...providers],
  controllers: [WechatTemplateController],
})
export class WechatTemplateModule {}
