import { Injectable, Inject } from '@nestjs/common';
import { SettingService, SettingKeyEnum } from '@app/common/setting';
import { WechatReplyScanCodeDTO } from './scancode.dto';
import { CommonTerminalEnum } from '@app/common/common.enum';

@Injectable()
export class WechatReplyScanCodeService {
  constructor(
    @Inject(SettingService)
    private settingEntityService: SettingService,
  ) {}

  /**
   * 获取扫码回复设置
   */
  async getScanCodeReply(target: CommonTerminalEnum, terminalId: number) {
    return this.settingEntityService.getSetting(
      target,
      terminalId,
      SettingKeyEnum.WECHAT_SCANCODE_REPLY,
      WechatReplyScanCodeDTO,
    );
  }

  /**
   * 更新扫码回复设置
   * @param data
   * @param identity
   */
  async setScanCodeReply(
    data: WechatReplyScanCodeDTO,
    userId: number,
    target: CommonTerminalEnum,
    terminalId: number,
  ) {
    return this.settingEntityService.setSetting({
      target,
      id: terminalId,
      userId,
      code: SettingKeyEnum.WECHAT_SCANCODE_REPLY,
      data,
    });
  }
}
