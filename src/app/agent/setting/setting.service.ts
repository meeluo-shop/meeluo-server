import { Injectable, Inject } from '@nestjs/common';
import { SettingKeyEnum, SettingService } from '@app/common/setting';
import { CommonTerminalEnum } from '@app/common/common.enum';
import { ClassType } from 'class-transformer/ClassTransformer';

@Injectable()
export class AgentSettingService {
  constructor(
    @Inject(SettingService)
    private settingService: SettingService,
  ) {}

  /**
   * 获取配置信息
   * @param param0
   */
  async getSetting<Schema>(
    agentId: number,
    code: SettingKeyEnum,
    schema: ClassType<Schema>,
    subCode?: string,
  ): Promise<Schema> {
    return this.settingService.getSetting(
      CommonTerminalEnum.AGENT,
      agentId,
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
    identity: AgentIdentity;
    code: SettingKeyEnum;
    data: Schema;
    subCode?: string;
  }) {
    const { agentId, userId } = identity;
    return this.settingService.setSetting({
      target: CommonTerminalEnum.AGENT,
      code,
      subCode,
      data,
      userId,
      id: agentId,
    });
  }

  /**
   * 删除配置信息
   * @param param0
   * @param code
   * @param subCode
   */
  async deleteSetting(
    { agentId, userId }: AgentIdentity,
    code: SettingKeyEnum,
    subCode?: string,
  ) {
    return this.settingService.deleteSetting({
      target: CommonTerminalEnum.AGENT,
      code,
      subCode,
      userId,
      id: agentId,
    });
  }
}
