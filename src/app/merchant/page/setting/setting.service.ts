import { Injectable, Inject } from '@nestjs/common';
import { SettingKeyEnum } from '@app/common/setting';
import { MerchantSettingService } from '@app/merchant/setting';
import { MerchantPageSettingDTO } from './setting.dto';

@Injectable()
export class MerchantPageSettingService {
  constructor(
    @Inject(MerchantSettingService)
    private settingEntityService: MerchantSettingService,
  ) {}

  /**
   * 获取页面内容配置
   * @param param0
   */
  async getPageSetting(pageId: number, merchantId: number) {
    const setting = await this.settingEntityService.getSetting(
      merchantId,
      SettingKeyEnum.PAGE,
      MerchantPageSettingDTO,
      String(pageId),
    );
    return setting?.data;
  }

  /**
   * 修改页面内容配置
   */
  async setPageSetting(
    pageId: number,
    data: MerchantPageSettingDTO,
    identity: MerchantIdentity,
  ) {
    return this.settingEntityService.setSetting({
      identity,
      code: SettingKeyEnum.PAGE,
      data,
      subCode: String(pageId),
    });
  }

  /**
   * 删除页面内容配置
   * @param merchantId
   * @param code
   */
  async deletePageSetting(pageId: number, identity: MerchantIdentity) {
    await this.settingEntityService.deleteSetting(
      identity,
      SettingKeyEnum.PAGE,
      String(pageId),
    );
  }
}
