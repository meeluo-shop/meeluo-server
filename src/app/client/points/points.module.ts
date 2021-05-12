import { Module } from '@nestjs/common';
import { ClientPointsSettingModule } from './setting';

const providers = [];
const modules = [ClientPointsSettingModule];

@Module({
  imports: modules,
  providers,
  exports: [...providers, ...modules],
  controllers: [],
})
export class ClientPointsModule {}
