import { Module, HttpModule } from '@nestjs/common';
import { ResourceModule } from '@app/common/resource';
import { CommonService } from '@app/common/common.service';
import { WechatSettingModule } from '../setting';
import { WechatMaterialService } from './material.service';
import {
  WechatMaterialVoiceController,
  WechatMaterialVoiceService,
} from './voice';
import {
  WechatMaterialImageController,
  WechatMaterialImageService,
} from './image';
import {
  WechatMaterialVideoController,
  WechatMaterialVideoService,
} from './video';
import {
  WechatMaterialTextController,
  WechatMaterialTextService,
} from './text';

const controllers = [
  WechatMaterialTextController,
  WechatMaterialVideoController,
  WechatMaterialVoiceController,
  WechatMaterialImageController,
];
const providers = [
  CommonService,
  WechatMaterialService,
  WechatMaterialTextService,
  WechatMaterialVoiceService,
  WechatMaterialImageService,
  WechatMaterialVideoService,
];
const modules = [HttpModule, ResourceModule, WechatSettingModule];

@Module({
  imports: [...modules],
  providers,
  exports: [...providers],
  controllers: [...controllers],
})
export class WechatMaterialModule {}
