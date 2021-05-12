import { Module } from '@nestjs/common';
import { SettingModule } from '@app/common/setting';
import { AgentSettingService } from './setting.service';

const providers = [AgentSettingService];

@Module({
  imports: [SettingModule],
  providers,
  exports: providers,
  controllers: [],
})
export class AgentSettingModule {}
