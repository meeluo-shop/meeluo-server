import { BaseService } from '@app/app.service';
import { Inject, Injectable } from '@nestjs/common';
// 建议通过装饰器读取配置，主要为了后期接nacos配置中心时，支持从远程拉取配置
import WechatConfig from '@config/wechat.config';
import { InjectService, In } from '@jiaxinjiang/nest-orm';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';
import { WechatMessageTemplateEntity } from '@typeorm/meeluoShop';
import { WechatOfficialAccountService } from '@shared/wechat';
import { OrmService } from '@typeorm/orm.service';
import { WechatSettingService } from '../setting';
import { WechatGetIndustryDTO } from './template.dto';
import { CommonTerminalEnum } from '@app/common/common.enum';
import { CommonService } from '@app/common/common.service';

@Injectable()
export class WechatTemplateService extends BaseService {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatSettingService)
    private wechatSettingService: WechatSettingService,
    @Inject(WechatOfficialAccountService)
    private officialAccountService: WechatOfficialAccountService,
    @InjectLogger(WechatTemplateService)
    private logger: LoggerProvider,
    @InjectService(WechatMessageTemplateEntity)
    private messageTemplateEntityService: OrmService<
      WechatMessageTemplateEntity
    >,
  ) {
    super();
  }

  getTemplateShortIds() {
    const templateShortIds: string[] = [];
    for (const key in WechatConfig.messageTemplate) {
      templateShortIds.push(WechatConfig.messageTemplate[key].templateId);
    }
    return templateShortIds;
  }

  /**
   * 获取当前行业类目
   */
  async getIndustry(
    target: CommonTerminalEnum,
    id: number,
  ): Promise<WechatGetIndustryDTO> {
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      id,
    );
    const account = this.officialAccountService.getAccount(config);
    return account.templateMessage.getIndustry();
  }

  /**
   * 设置公众号行业类目为：电子商务、网络游戏
   */
  async setIndustry(target: CommonTerminalEnum, id: number) {
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      id,
    );
    const account = this.officialAccountService.getAccount(config);
    const { industry } = WechatConfig;
    await account.templateMessage.setIndustry(
      industry.primary,
      industry.secondary,
    );
    return true;
  }

  /**
   * 获取商户下的模板消息
   */
  async getTemplateMessage(target: CommonTerminalEnum, id: number) {
    const templateShortIds = this.getTemplateShortIds();
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      id,
    );
    const condition = this.commonService.getTerminalCondition(target, id);
    // 获取数据库中的商户消息模板列表
    return this.messageTemplateEntityService.find({
      where: {
        ...condition,
        appid: config.appId,
        templateShortId: In(templateShortIds),
      },
    });
  }

  /**
   * 删除公众号模板消息
   */
  async delTemplateMessage(
    target: CommonTerminalEnum,
    id: number,
    shortId: string,
    userId: number,
  ) {
    const templateInfo = Object.values(WechatConfig.messageTemplate).find(
      val => val.templateId === shortId,
    );
    if (!templateInfo) {
      return null;
    }
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      id,
    );
    const account = this.officialAccountService.getAccount(config);
    const condition = this.commonService.getTerminalCondition(target, id);
    const template = await this.messageTemplateEntityService.findOne({
      select: ['templateId'],
      where: {
        ...condition,
        appid: config.appId,
        templateShortId: shortId,
      },
    });
    if (template) {
      await this.messageTemplateEntityService.deleteById(template.id, userId);
    }
    await account.templateMessage
      .deletePrivateTemplate(template.templateId)
      .catch(err => this.logger.error(err));
    return templateInfo;
  }

  /**
   * 设置公众号模板消息
   */
  async setTemplateMessage(
    target: CommonTerminalEnum,
    id: number,
    userId: number,
  ) {
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      id,
    );
    const account = this.officialAccountService.getAccount(config);
    const appid = config.appId;
    const condition = this.commonService.getTerminalCondition(target, id);
    const getMessageTemplateList = async () => {
      return this.messageTemplateEntityService.find({
        where: {
          ...condition,
          appid,
          templateShortId: In(this.getTemplateShortIds()),
        },
      });
    };
    // 获取数据库中的商户消息模板列表
    const messageTemplateList = await getMessageTemplateList();
    // 获取微信公众号的消息模板列表
    const templateResp = await account.templateMessage.getPrivateTemplates();
    const dbShortIds: string[] = [];
    const wxShortIds: string[] = [];
    for (const templateInfo of Object.values(WechatConfig.messageTemplate)) {
      // 判断数据库中未增加该模板
      if (
        !dbShortIds.includes(templateInfo.templateId) &&
        !messageTemplateList.find(
          item => item.templateShortId === templateInfo.templateId,
        )
      ) {
        dbShortIds.push(templateInfo.templateId);
      }
      // 判断微信公众号未增加该模板
      if (
        !wxShortIds.includes(templateInfo.templateId) &&
        !templateResp.templateList.find(
          item => item.title === templateInfo.name,
        )
      ) {
        wxShortIds.push(templateInfo.templateId);
      }
    }
    // 如果数据库和微信公众号中都存在模板则直接返回
    if (!dbShortIds.length && !wxShortIds.length) {
      return messageTemplateList;
    }
    // 如果数据库中都存在，但微信公众号中不存在
    if (!dbShortIds.length && wxShortIds.length) {
      // 给公众号增加缺少的模板
      const addTemplateList = await Promise.all(
        wxShortIds.map(shortId => {
          return account.templateMessage.addTemplate(shortId).catch(err => {
            this.logger.error(err);
            return { templateId: null };
          });
        }),
      );
      // 更新数据库中模板id
      await Promise.all(
        addTemplateList.map((item, index) =>
          item.templateId
            ? this.messageTemplateEntityService.update(
                {
                  templateId: item.templateId,
                },
                {
                  ...condition,
                  templateShortId: wxShortIds[index],
                  appid,
                },
                userId,
              )
            : null,
        ),
      );
    }
    // 如果数据库中不存在，公众号中存在
    if (dbShortIds.length && !wxShortIds.length) {
      // 往数据库中插入模板
      await this.messageTemplateEntityService.createMany(
        dbShortIds
          .map(shortId => {
            const templateInfo = Object.values(
              WechatConfig.messageTemplate,
            ).find(item => item.templateId === shortId);
            const templateItem = templateResp.templateList.find(
              item => item.title === templateInfo?.name,
            );
            return templateItem
              ? {
                  ...condition,
                  templateId: templateItem.templateId,
                  templateShortId: shortId,
                  appid,
                  title: templateItem.title,
                  content: templateItem.content,
                  primaryIndustry: templateItem.primaryIndustry,
                  deputyIndustry: templateItem.deputyIndustry,
                }
              : null;
          })
          .filter(item => !!item),
        userId,
      );
    }
    // 如果数据库中不存在，公众号中也不存在
    if (dbShortIds.length && wxShortIds.length) {
      // 先增加公众号模板
      await Promise.all(
        wxShortIds.map(shortId => {
          return account.templateMessage.addTemplate(shortId).catch(err => {
            this.logger.error(err);
            return { templateId: null };
          });
        }),
      );
      // 重新获取微信公众号的消息模板列表
      const templateResp = await account.templateMessage.getPrivateTemplates();
      // 更新数据库模板
      await Promise.all(
        templateResp.templateList.map(item => {
          const templateInfo = Object.values(WechatConfig.messageTemplate).find(
            val => val.name === item.title,
          );
          return templateInfo
            ? this.messageTemplateEntityService.upsert(
                {
                  ...condition,
                  templateId: item.templateId,
                  templateShortId: templateInfo.templateId,
                  appid,
                  title: item.title,
                  content: item.content,
                  primaryIndustry: item.primaryIndustry,
                  deputyIndustry: item.deputyIndustry,
                },
                {
                  ...condition,
                  templateShortId: templateInfo.templateId,
                  appid,
                },
                userId,
              )
            : null;
        }),
      );
    }
    // 重新查询数据库模板列表，并返回
    return getMessageTemplateList();
  }
}
