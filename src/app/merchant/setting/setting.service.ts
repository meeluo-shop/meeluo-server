import { Injectable, Inject } from '@nestjs/common';
import { SettingKeyEnum, SettingService } from '@app/common/setting';
import { CommonTerminalEnum } from '@app/common/common.enum';
import { ClassType } from 'class-transformer/ClassTransformer';

@Injectable()
export class MerchantSettingService {
  constructor(
    @Inject(SettingService)
    private settingService: SettingService,
  ) {}

  /**
   * 获取配置信息
   * @param param0
   */
  async getSetting<Schema>(
    merchantId: number,
    code: SettingKeyEnum,
    schema: ClassType<Schema>,
    subCode?: string,
  ): Promise<Schema> {
    return this.settingService.getSetting(
      CommonTerminalEnum.MERCHANT,
      merchantId,
      code,
      schema,
      subCode,
    );
  }

  /**
   * 修改配置信息
   * @param param0
   */
  async setSetting<Schema>({
    identity,
    code,
    data,
    subCode,
  }: {
    identity: MerchantIdentity;
    code: SettingKeyEnum;
    data: Schema;
    subCode?: string;
  }) {
    const { merchantId, userId } = identity;
    return this.settingService.setSetting({
      target: CommonTerminalEnum.MERCHANT,
      code,
      subCode,
      data,
      userId,
      id: merchantId,
    });
  }

  /**
   * 删除配置信息
   * @param param0
   * @param code
   * @param subCode
   */
  async deleteSetting(
    { merchantId, userId }: MerchantIdentity,
    code: SettingKeyEnum,
    subCode?: string,
  ) {
    return this.settingService.deleteSetting({
      target: CommonTerminalEnum.MERCHANT,
      code,
      subCode,
      userId,
      id: merchantId,
    });
  }
}
