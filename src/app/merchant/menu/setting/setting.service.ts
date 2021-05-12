import { Injectable, Inject } from '@nestjs/common';
import { SettingKeyEnum } from '@app/common/setting';
import { MerchantSettingService } from '@app/merchant/setting';
import {
  MerchantMenuOrderSettingDTO,
  MerchantMenuPayTypeSettingDTO,
} from './setting.dto';

@Injectable()
export class MerchantMenuSettingService {
  constructor(
    @Inject(MerchantSettingService)
    private settingEntityService: MerchantSettingService,
  ) {}

  /**
   * 获取点餐订单设置
   */
  async getOrderSetting(merchantId: number) {
    return this.settingEntityService.getSetting(
      merchantId,
      SettingKeyEnum.MENU_ORDER,
      MerchantMenuOrderSettingDTO,
    );
  }

  /**
   * 更新订单设置
   * @param data
   * @param identity
   */
  async setOrderSetting(
    data: MerchantMenuOrderSettingDTO,
    identity: MerchantIdentity,
  ) {
    return this.settingEntityService.setSetting({
      identity,
      code: SettingKeyEnum.MENU_ORDER,
      data,
    });
  }

  /**
   * 获取点餐支付方式列表
   */
  async getPayTypeSetting(merchantId: number) {
    return this.settingEntityService.getSetting(
      merchantId,
      SettingKeyEnum.MENU_PAY_TYPE_LIST,
      MerchantMenuPayTypeSettingDTO,
    );
  }

  /**
   * 更新点餐支付方式列表
   * @param data
   * @param identity
   */
  async setPayTypeSetting(
    data: MerchantMenuPayTypeSettingDTO,
    identity: MerchantIdentity,
  ) {
    return this.settingEntityService.setSetting({
      identity,
      code: SettingKeyEnum.MENU_PAY_TYPE_LIST,
      data,
    });
  }
}
