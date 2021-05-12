import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { CommonService } from '../common.service';

const providers = [CommonService, SettingService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [],
})
export class SettingModule {}
