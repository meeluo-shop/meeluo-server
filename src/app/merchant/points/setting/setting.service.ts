import { Injectable, Inject } from '@nestjs/common';
import { SettingKeyEnum } from '@app/common/setting';
import { MerchantSettingService } from '@app/merchant/setting';
import { MerchantPointsSettingDTO } from './setting.dto';

@Injectable()
export class MerchantPointsSettingService {
  constructor(
    @Inject(MerchantSettingService)
    private settingEntityService: MerchantSettingService,
  ) {}

  /**
   * 获取积分设置
   */
  async getPointsSetting(merchantId: number) {
    return this.settingEntityService.getSetting(
      merchantId,
      SettingKeyEnum.POINTS,
      MerchantPointsSettingDTO,
    );
  }

  /**
   * 更新积分设置
   * @param data
   * @param identity
   */
  async setPointsSetting(
    data: MerchantPointsSettingDTO,
    identity: MerchantIdentity,
  ) {
    return this.settingEntityService.setSetting({
      identity,
      code: SettingKeyEnum.POINTS,
      data,
    });
  }
}
