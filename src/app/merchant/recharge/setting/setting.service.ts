import { Injectable, Inject } from '@nestjs/common';
import { SettingKeyEnum } from '@app/common/setting';
import { MerchantSettingService } from '@app/merchant/setting';
import { MerchantRechargeSettingDTO } from './setting.dto';

@Injectable()
export class MerchantRechargeSettingService {
  constructor(
    @Inject(MerchantSettingService)
    private settingEntityService: MerchantSettingService,
  ) {}

  /**
   * 获取用户充值设置
   * @param param0
   */
  async getRechargeSetting(merchantId: number) {
    return this.settingEntityService.getSetting(
      merchantId,
      SettingKeyEnum.RECHARGE,
      MerchantRechargeSettingDTO,
    );
  }

  /**
   * 修改用户充值设置
   */
  async setRechargeSetting(
    data: MerchantRechargeSettingDTO,
    identity: MerchantIdentity,
  ) {
    return this.settingEntityService.setSetting({
      identity,
      code: SettingKeyEnum.RECHARGE,
      data,
    });
  }
}
