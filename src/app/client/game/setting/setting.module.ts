import { Module } from '@nestjs/common';
import { MerchantGamePrizeSettingModule } from '@app/merchant/game/prize/setting';
import { ClientGamePrizeSettingController } from './setting.controller';
import { ClientGamePrizeSettingService } from './setting.service';

const providers = [ClientGamePrizeSettingService];

@Module({
  imports: [MerchantGamePrizeSettingModule],
  providers,
  exports: providers,
  controllers: [ClientGamePrizeSettingController],
})
export class ClientGamePrizeSettingModule {}
