import { Injectable, Inject } from '@nestjs/common';
import { MerchantGamePrizeSettingService } from '@app/merchant/game/prize/setting';

@Injectable()
export class ClientGamePrizeSettingService {
  constructor(
    @Inject(MerchantGamePrizeSettingService)
    private prizeSettingService: MerchantGamePrizeSettingService,
  ) {}

  async getGamePrizeSetting(merchantId: number) {
    return this.prizeSettingService.getGamePrizeSetting(merchantId);
  }
}
