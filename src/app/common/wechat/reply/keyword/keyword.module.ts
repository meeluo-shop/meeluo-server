import { Module } from '@nestjs/common';
import { WechatSettingModule } from '../../setting';
import { WechatMaterialModule } from '../../material';
import { WechatKeywordController } from './keyword.controller';
import { WechatKeywordService } from './keyword.service';
import { CommonService } from '@app/common/common.service';

const providers = [WechatKeywordService, CommonService];
const modules = [WechatSettingModule, WechatMaterialModule];

@Module({
  imports: [...modules],
  providers,
  exports: providers,
  controllers: [WechatKeywordController],
})
export class WechatReplyKeywordModule {}
