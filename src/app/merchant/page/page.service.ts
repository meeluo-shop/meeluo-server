import { Injectable, Inject } from '@nestjs/common';
import { MerchantPageEntity, MerchantPageTypeEnum } from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import { MerchantModifyPageDTO, MerchantPageListDTO } from './page.dto';
import {
  InjectService,
  Repository,
  Transaction,
  TransactionRepository,
} from '@jiaxinjiang/nest-orm';
import { OrmService } from '@typeorm/orm.service';
import { MerchantPageSettingService } from './setting';
import { MerchantPageTypeExistsException } from './page.exception';
import { MEELUO_SHOP_DATABASE } from '@core/constant';

@Injectable()
export class MerchantPageService extends BaseService {
  constructor(
    @Inject(MerchantPageSettingService)
    private settingSerivce: MerchantPageSettingService,
    @InjectService(MerchantPageEntity)
    private pageEntityService: OrmService<MerchantPageEntity>,
  ) {
    super();
  }

  /**
   * 获取页面列表
   * @param param0
   * @param param1
   */
  async list(
    { pageIndex, pageSize }: MerchantPageListDTO,
    { merchantId }: MerchantIdentity,
  ) {
    return this.pageEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        merchantId,
      },
      order: {
        order: 'ASC',
        id: 'DESC',
      },
    });
  }

  /**
   * 获取页面详情
   * @param id
   * @param param1
   */
  async detail(id: number, identity: MerchantIdentity) {
    const detail = await this.pageEntityService.findOne({
      where: {
        id,
        merchantId: identity.merchantId,
      },
    });
    detail.data = await this.settingSerivce.getPageSetting(
      id,
      identity.merchantId,
    );
    return detail;
  }

  /**
   * 创建页面
   * @param data
   * @param param1
   */
  async create(data: MerchantModifyPageDTO, identity: MerchantIdentity) {
    const pageSetting = data.data;
    const { merchantId, user } = identity;
    if (data.type) {
      // 检查页面类型是否存在
      await this.checkPageHasType(data.type, identity);
    }
    const pageInfo = await this.pageEntityService.create(
      {
        ...data,
        merchantId,
      },
      user.id,
    );
    await this.settingSerivce.setPageSetting(
      pageInfo.id,
      {
        data: pageSetting,
      },
      identity,
    );
    return pageInfo;
  }

  /**
   * 设置页面类型
   * @param id
   * @param type
   * @param identity
   */

  @Transaction(MEELUO_SHOP_DATABASE)
  async setType(
    id: number,
    type: MerchantPageTypeEnum,
    identity: MerchantIdentity,
    @TransactionRepository(MerchantPageEntity)
    pageRepo?: Repository<MerchantPageEntity>,
  ) {
    const { merchantId, userId } = identity;
    const pageEntityService = this.getService(pageRepo);
    await pageEntityService.update(
      {
        type: MerchantPageTypeEnum.NO_TYPE,
      },
      {
        merchantId,
        type,
      },
      userId,
    );
    await pageEntityService.update(
      {
        type,
      },
      {
        id,
        merchantId,
      },
      userId,
    );
    return true;
  }

  /**
   * 修改页面
   * @param data
   * @param param1
   */
  async update(
    id: number,
    data: MerchantModifyPageDTO,
    identity: MerchantIdentity,
  ) {
    const pageSetting = data.data;
    delete data.data;
    const { merchantId, user } = identity;
    if (data.type) {
      // 检查页面类型是否存在
      await this.checkPageHasType(data.type, identity, id);
    }
    await this.pageEntityService.update(
      {
        ...data,
      },
      {
        id,
        merchantId,
      },
      user.id,
    );
    await this.settingSerivce.setPageSetting(
      id,
      {
        data: pageSetting,
      },
      identity,
    );
    return true;
  }

  /**
   * 删除页面
   * @param id
   * @param param1
   */
  async delete(id: number, identity: MerchantIdentity) {
    const { user, merchantId } = identity;
    await this.pageEntityService.delete(
      {
        id,
        merchantId,
        type: MerchantPageTypeEnum.NO_TYPE, // 只能删除无类型的页面
      },
      user.id,
    );
    // 删除页面配置
    await this.settingSerivce.deletePageSetting(id, identity);
    return true;
  }

  /**
   * 判断该页面类型是否存在
   * @param id
   * @param type
   * @param identity
   */
  private async checkPageHasType(
    type: MerchantPageTypeEnum,
    identity: MerchantIdentity,
    id?: number,
  ) {
    const { merchantId } = identity;
    const pageinfo = await this.pageEntityService.findOne({
      select: ['id'],
      where: {
        merchantId,
        type,
      },
    });
    if (pageinfo?.id && (id ? pageinfo.id !== id : true)) {
      throw new MerchantPageTypeExistsException();
    }
    return true;
  }
}
