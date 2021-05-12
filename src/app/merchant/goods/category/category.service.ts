import { Injectable, Inject } from '@nestjs/common';
import { InjectService } from '@jiaxinjiang/nest-orm';
import {
  MerchantGoodsCategoryEntity,
  MerchantGoodsEntity,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  ModifyMerchantGoodsCategoryDTO,
  MerchantGoodsCategoryListDTO,
} from './category.dto';
import {
  MerchantGoodsCategoryHasGoodsException,
  MerchantGoodsCategoryHasChildrenException,
} from './category.exception';
import { OrmService } from '@typeorm/orm.service';
import { ResourceService } from '@app/common/resource';

@Injectable()
export class MerchantGoodsCategoryService extends BaseService {
  constructor(
    @Inject(ResourceService)
    private resourceService: ResourceService,
    @InjectService(MerchantGoodsEntity)
    private goodsEntityService: OrmService<MerchantGoodsEntity>,
    @InjectService(MerchantGoodsCategoryEntity)
    private categoryEntityService: OrmService<MerchantGoodsCategoryEntity>,
  ) {
    super();
  }

  /**
   * 获取商品分类列表
   * @param param0
   * @param param1
   */
  async list(
    { pageIndex, pageSize, superiorId, type }: MerchantGoodsCategoryListDTO,
    merchantId: number,
  ) {
    const result = await this.categoryEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        superiorId: superiorId === 0 ? null : superiorId,
        merchantId,
        type,
      },
      order: {
        order: 'ASC',
      },
    });
    await this.resourceService.bindTargetResource(
      result.rows,
      'image',
      'imageId',
    );
    return {
      rows: this.clearExtraFields(result.rows, true),
      count: result.count,
    };
  }

  /**
   * 创建商品分类
   * @param data
   * @param param1
   */
  async create(
    data: ModifyMerchantGoodsCategoryDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    return this.categoryEntityService.create(
      {
        ...data,
        merchantId,
      },
      user.id,
    );
  }

  /**
   * 修改商品分类
   * @param id
   * @param data
   * @param param2
   */
  async update(
    id: number,
    data: ModifyMerchantGoodsCategoryDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    if (!data.superiorId) {
      data.superiorId = null;
    }
    await this.categoryEntityService.update(
      data,
      {
        id,
        merchantId,
      },
      user.id,
    );
    return true;
  }

  /**
   * 获取商品分类详情
   * @param id
   * @param param1
   */
  async detail(id: number, { merchantId }: MerchantIdentity) {
    return this.categoryEntityService.findOne({
      where: {
        id,
        merchantId,
      },
    });
  }

  /**
   * 删除商品分类
   * @param id
   * @param param1
   */
  async delete(id: number, { user, merchantId }: MerchantIdentity) {
    const goodsCount = await this.goodsEntityService.count({
      categoryId: id,
      merchantId,
    });
    if (goodsCount) {
      throw new MerchantGoodsCategoryHasGoodsException();
    }
    const subCount = await this.categoryEntityService.count({
      superiorId: id,
      merchantId,
    });
    if (subCount) {
      throw new MerchantGoodsCategoryHasChildrenException();
    }
    await this.categoryEntityService.delete(
      {
        id,
        merchantId,
      },
      user.id,
    );
    return true;
  }
}
