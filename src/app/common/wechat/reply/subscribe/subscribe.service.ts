import { Injectable, Inject } from '@nestjs/common';
import { SettingService, SettingKeyEnum } from '@app/common/setting';
import {
  WechatReplySubscribeDTO,
  WechatReplySubscribeResp,
} from './subscribe.dto';
import { WechatMaterialService } from '../../material';
import { CommonTerminalEnum } from '@app/common/common.enum';
import { WechatSettingService } from '../../setting';

@Injectable()
export class WechatReplySubscribeService {
  constructor(
    @Inject(WechatSettingService)
    private wechatSettingService: WechatSettingService,
    @Inject(WechatMaterialService)
    private materialService: WechatMaterialService,
    @Inject(SettingService)
    private settingEntityService: SettingService,
  ) {}

  /**
   * 获取关注回复设置
   */
  async getSubscribeReply(target: CommonTerminalEnum, terminalId: number) {
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      terminalId,
    );
    const setting = await this.settingEntityService.getSetting(
      target,
      terminalId,
      SettingKeyEnum.WECHAT_SUBSCRIBE_REPLY,
      WechatReplySubscribeDTO,
      config.appId,
    );
    const result: WechatReplySubscribeResp = {
      ...setting,
      material: null,
    };
    if (setting.materialId) {
      result.material = await this.materialService.detail({
        id: setting.materialId,
        target,
        terminalId,
      });
    }
    return result;
  }

  /**
   * 更新关注回复设置
   * @param data
   * @param identity
   */
  async setSubscribeReply(
    data: WechatReplySubscribeDTO,
    userId: number,
    target: CommonTerminalEnum,
    terminalId: number,
  ) {
    await this.materialService.checkMediaIdType(
      data.materialId,
      data.type,
      target,
      terminalId,
    );
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      terminalId,
    );
    return this.settingEntityService.setSetting({
      target,
      id: terminalId,
      userId,
      code: SettingKeyEnum.WECHAT_SUBSCRIBE_REPLY,
      subCode: config.appId,
      data,
    });
  }
}
