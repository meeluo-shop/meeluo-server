import { Injectable, Inject } from '@nestjs/common';
import { SettingKeyEnum } from '@app/common/setting';
import { MerchantSettingService } from '@app/merchant/setting';
import { MerchantGamePrizeSettingDTO } from './setting.dto';

@Injectable()
export class MerchantGamePrizeSettingService {
  constructor(
    @Inject(MerchantSettingService)
    public settingService: MerchantSettingService,
  ) {}

  async getGamePrizeSetting(merchantId: number) {
    return this.settingService.getSetting(
      merchantId,
      SettingKeyEnum.GAME_PRIZE,
      MerchantGamePrizeSettingDTO,
    );
  }

  async setGamePrizeSetting(
    data: MerchantGamePrizeSettingDTO,
    identity: MerchantIdentity,
  ) {
    return this.settingService.setSetting({
      identity,
      code: SettingKeyEnum.GAME_PRIZE,
      data,
    });
  }
}
