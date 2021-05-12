import { Injectable, Inject } from '@nestjs/common';
import { MerchantPointsSettingService } from '@app/merchant/points/setting';

@Injectable()
export class ClientPointsSettingService {
  constructor(
    @Inject(MerchantPointsSettingService)
    private pointsSettingService: MerchantPointsSettingService,
  ) {}

  /**
   * 获取积分设置
   */
  async getPointsSetting(merchantId: number) {
    return this.pointsSettingService.getPointsSetting(merchantId);
  }
}
