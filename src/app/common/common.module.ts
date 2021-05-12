import { AuthModule } from '@core/decorator';
import { QiniuModule } from './qiniu';
import { RegionModule } from './region';
import { ResourceModule } from './resource';
import { SettingModule } from './setting';
import { WechatModule } from './wechat';
import { CodeModule } from './code';
import { SMSModule } from './sms';

const modules = [
  SettingModule,
  QiniuModule,
  RegionModule,
  ResourceModule,
  WechatModule,
  CodeModule,
  SMSModule,
];

@AuthModule({
  imports: modules,
  providers: [],
  exports: modules,
  controllers: [],
})
export class CommonModule {}
