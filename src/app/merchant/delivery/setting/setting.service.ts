import { Injectable, Inject } from '@nestjs/common';
import { SettingKeyEnum } from '@app/common/setting';
import { MerchantSettingService } from '@app/merchant/setting';
import { MerchantDeliverySettingDTO } from './setting.dto';

@Injectable()
export class MerchantDeliverySettingService {
  constructor(
    @Inject(MerchantSettingService)
    private settingEntityService: MerchantSettingService,
  ) {}

  /**
   * 获取运费设置
   */
  async getSetting(merchantId: number) {
    return this.settingEntityService.getSetting(
      merchantId,
      SettingKeyEnum.DELIVERY,
      MerchantDeliverySettingDTO,
    );
  }

  /**
   * 更新运费设置
   * @param data
   * @param identity
   */
  async setSetting(
    data: MerchantDeliverySettingDTO,
    identity: MerchantIdentity,
  ) {
    return this.settingEntityService.setSetting({
      identity,
      code: SettingKeyEnum.DELIVERY,
      data,
    });
  }
}
