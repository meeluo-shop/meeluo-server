import { settingDesc } from './setting.config';
import { plainToClass } from 'class-transformer';
import { Injectable, Inject } from '@nestjs/common';
import { InjectService } from '@jiaxinjiang/nest-orm';
import { CommonSettingEntity } from '@typeorm/meeluoShop';
import { SettingKeyEnum } from './setting.enum';
import { CommonService } from '../common.service';
import { CommonTerminalEnum } from '../common.enum';
import { ClassType } from 'class-transformer/ClassTransformer';
import { CommonSettingInvalidKeyException } from './setting.exception';
import { OrmService } from '@typeorm/orm.service';
import { ServiceCache, CacheProvider } from '@jiaxinjiang/nest-redis';

@Injectable()
export class SettingService {
  constructor(
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @Inject(CommonService)
    private commonService: CommonService,
    @InjectService(CommonSettingEntity)
    private settingEntityService: OrmService<CommonSettingEntity>,
  ) {}

  /**
   * 获取配置信息
   * @param param0
   */
  @ServiceCache(7200) // 缓存2小时
  async getSetting<Schema>(
    target: CommonTerminalEnum,
    id: number,
    code: SettingKeyEnum,
    schema: ClassType<Schema>,
    subCode?: string,
    _cacheOptions?: { __updateCache: boolean },
  ): Promise<Schema> {
    const condition = this.commonService.getTerminalCondition<
      CommonSettingEntity
    >(target, id, {
      code,
      subCode,
    });
    const record = await this.settingEntityService.findOne({
      where: condition,
    });
    const content = JSON.parse(record?.content || '{}');
    return plainToClass(schema, content);
  }

  /**
   * 修改配置信息
   * @param param0
   */
  async setSetting<Schema>({
    target,
    id,
    userId,
    code,
    data,
    subCode,
  }: {
    target: CommonTerminalEnum;
    id: number;
    userId: number;
    code: SettingKeyEnum;
    data: Schema;
    subCode?: string;
  }) {
    const remark = settingDesc[code];
    if (!remark) {
      throw new CommonSettingInvalidKeyException();
    }
    const condition = this.commonService.getTerminalCondition<
      CommonSettingEntity
    >(target, id, {
      code,
      subCode,
    });
    // 清除缓存
    await this.clearSettingCache(target, id, code);
    await this.settingEntityService.upsert(
      {
        ...condition,
        code,
        subCode,
        remark,
        content: JSON.stringify(data),
      },
      condition,
      userId,
    );
    return true;
  }

  /**
   * 删除配置信息
   * @param param0
   * @param code
   * @param subCode
   */
  async deleteSetting({
    target,
    id,
    userId,
    code,
    subCode,
  }: {
    target: CommonTerminalEnum;
    id: number;
    userId: number;
    code: SettingKeyEnum;
    subCode?: string;
  }) {
    // 清除缓存
    await this.clearSettingCache(target, id, code);
    const condition = this.commonService.getTerminalCondition<
      CommonSettingEntity
    >(target, id, {
      code,
      subCode,
    });
    await this.settingEntityService.delete(condition, userId);
    return true;
  }

  /**
   * 清除缓存配置
   * @param target
   * @param id
   * @param code
   */
  async clearSettingCache(
    target: CommonTerminalEnum,
    id: number,
    code: string,
  ) {
    await this.cacheProvider.clearServiceCache(
      this.getSetting,
      target,
      id,
      code,
    );
  }
}
