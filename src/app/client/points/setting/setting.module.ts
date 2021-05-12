import { Module } from '@nestjs/common';
import { MerchantPointsSettingModule } from '@app/merchant/points/setting';
import { ClientPointsSettingController } from './setting.controller';
import { ClientPointsSettingService } from './setting.service';

const providers = [ClientPointsSettingService];

@Module({
  imports: [MerchantPointsSettingModule],
  providers,
  exports: providers,
  controllers: [ClientPointsSettingController],
})
export class ClientPointsSettingModule {}
