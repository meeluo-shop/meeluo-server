import { Injectable, Inject } from '@nestjs/common';
import { SettingKeyEnum } from '@app/common/setting';
import { MerchantSettingService } from '@app/merchant/setting';
import { MerchantOrderSettingDTO } from './setting.dto';

@Injectable()
export class MerchantOrderSettingService {
  constructor(
    @Inject(MerchantSettingService)
    private settingEntityService: MerchantSettingService,
  ) {}

  /**
   * 获取订单设置
   */
  async getOrderSetting(merchantId: number) {
    return this.settingEntityService.getSetting(
      merchantId,
      SettingKeyEnum.ORDER,
      MerchantOrderSettingDTO,
    );
  }

  /**
   * 更新订单设置
   * @param data
   * @param identity
   */
  async setOrderSetting(
    data: MerchantOrderSettingDTO,
    identity: MerchantIdentity,
  ) {
    return this.settingEntityService.setSetting({
      identity,
      code: SettingKeyEnum.ORDER,
      data,
    });
  }
}
