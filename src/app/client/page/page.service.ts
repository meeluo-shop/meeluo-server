import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import { MerchantPageSettingService } from '@app/merchant/page/setting';
import { InjectService, Not } from '@jiaxinjiang/nest-orm';
import { MerchantPageEntity, MerchantPageTypeEnum } from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';

@Injectable()
export class ClientPageService extends BaseService {
  constructor(
    @InjectLogger(MerchantPageSettingService)
    private logger: LoggerProvider,
    @Inject(MerchantPageSettingService)
    private settingService: MerchantPageSettingService,
    @InjectService(MerchantPageEntity)
    private pageEntityService: OrmService<MerchantPageEntity>,
  ) {
    super();
  }

  /**
   * 获取页面列表
   * @param param0
   */
  async list({ merchantId }: ClientIdentity) {
    return this.pageEntityService.find({
      select: ['name', 'type', 'order'],
      where: {
        merchantId,
        type: Not(MerchantPageTypeEnum.NO_TYPE),
      },
    });
  }

  /**
   * 获取自定义页面内容
   * @param pageId
   * @param merchantId
   * @returns
   */
  async pageInfo(pageId: number, merchantId: number) {
    if (!pageId) {
      return null;
    }
    const setting = await this.settingService.getPageSetting(
      pageId,
      merchantId,
    );
    try {
      return JSON.parse(setting);
    } catch (err) {
      this.logger.error(err);
      return null;
    }
  }

  /**
   * 获取系统页面内容
   * @param param1
   */
  async systemPageInfo(
    type: MerchantPageTypeEnum,
    { merchantId }: ClientIdentity,
  ) {
    const pageDetail = await this.pageEntityService.findOne({
      select: ['id'],
      where: {
        type,
        merchantId,
      },
    });
    return this.pageInfo(pageDetail.id, merchantId);
  }
}
