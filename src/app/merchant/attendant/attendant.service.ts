import { Injectable, Inject } from '@nestjs/common';
import { SettingKeyEnum } from '@app/common/setting';
import { MerchantSettingService } from '@app/merchant/setting';
import { MerchantAttendantDTO } from './attendant.dto';

@Injectable()
export class MerchantAttendantService {
  constructor(
    @Inject(MerchantSettingService)
    private settingEntityService: MerchantSettingService,
  ) {}

  /**
   * 获取客服信息
   */
  async getAttendant(merchantId: number) {
    return this.settingEntityService.getSetting(
      merchantId,
      SettingKeyEnum.ATTENDANT,
      MerchantAttendantDTO,
    );
  }

  /**
   * 更新客服信息
   * @param data
   * @param identity
   */
  async setAttendant(data: MerchantAttendantDTO, identity: MerchantIdentity) {
    return this.settingEntityService.setSetting({
      identity,
      code: SettingKeyEnum.ATTENDANT,
      data,
    });
  }
}
