import { Injectable, Inject } from '@nestjs/common';
import {
  MerchantGoodsEntity,
  MerchantGoodsSkuEntity,
  MerchantGoodsSpecTypeEnum,
  MerchantGoodsSpecMappingEntity,
  MerchantGoodsIsActiveEnum,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  MerchantGoodsListDTO,
  ModifyMerchantGoodsDTO,
  MerchantGoodsIdsDTO,
  MerchantGoodsOrderTypeEnum,
} from './goods.dto';
import { GetMerchantGoodsDetailFailedException } from './goods.exception';
import {
  InjectService,
  Transaction,
  Repository,
  TransactionRepository,
  In,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantCouponService } from '@app/merchant/coupon';
import { ServiceCache, CacheProvider } from '@jiaxinjiang/nest-redis';
import { OrmService } from '@typeorm/orm.service';
import { ResourceService } from '@app/common/resource';
import { MerchantGoodsSpecService } from './spec';

@Injectable()
export class MerchantGoodsService extends BaseService {
  constructor(
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @Inject(ResourceService)
    private resourceService: ResourceService,
    @Inject(MerchantGoodsSpecService)
    private specService: MerchantGoodsSpecService,
    @Inject(MerchantCouponService)
    private couponService: MerchantCouponService,
    @InjectService(MerchantGoodsEntity)
    private goodsEntityService: OrmService<MerchantGoodsEntity>,
    @InjectService(MerchantGoodsSkuEntity)
    private goodsSkuEntityService: OrmService<MerchantGoodsSkuEntity>,
  ) {
    super();
  }

  /**
   * 获取商品详情
   * @param id
   * @param param1
   */
  @ServiceCache(3600 * 2) // 缓存2小时
  async detail(
    id: number,
    merchantId: number,
    _cacheOptions?: { __updateCache: boolean },
  ) {
    const goods = await this.goodsEntityService.findOne({
      where: {
        id,
        merchantId,
      },
    });
    if (!goods) {
      return goods;
    }
    await Promise.all([
      this.resourceService.bindTargetResource(
        goods,
        'thumbnail',
        'thumbnailId',
      ),
      this.resourceService.bindTargetResourceList(
        goods,
        this.goodsEntityService.repository,
        'images',
      ),
      this.couponService.bindCouponInfo<MerchantGoodsEntity>(
        goods,
        'giftCoupon',
        'giftCouponId',
      ),
    ]);
    goods.skus = await this.goodsSkuEntityService.find({
      where: {
        goodsId: id,
        merchantId,
      },
    });
    await Promise.all([
      this.resourceService.bindTargetResource(goods.skus, 'image', 'imageId'),
      this.specService.bindGoodsSpecList(goods),
    ]);
    return this.clearExtraFields(goods, true);
  }

  /**
   * 清除商品详情缓存
   * @param id
   * @param merchantId
   */
  async clearDetailCache(id: number, merchantId: number) {
    // 清除缓存
    await this.cacheProvider.clearServiceCache(this.detail, id, merchantId);
  }

  /**
   * 获取商品列表
   * @param param0
   * @param param1
   */
  async list(
    {
      pageSize,
      pageIndex,
      categoryId,
      name,
      isActive,
      orderType,
      type,
    }: MerchantGoodsListDTO,
    { ids }: MerchantGoodsIdsDTO,
    merchantId: number,
  ) {
    let order: {
      [P in keyof MerchantGoodsEntity]?: 'ASC' | 'DESC' | 1 | -1;
    };
    switch (orderType) {
      case MerchantGoodsOrderTypeEnum.DEFAULT:
        order = { order: 'ASC' };
        break;
      case MerchantGoodsOrderTypeEnum.SALES:
        order = { salesActual: 'DESC' };
        break;
      case MerchantGoodsOrderTypeEnum.NEW:
        order = { id: 'DESC' };
        break;
      case MerchantGoodsOrderTypeEnum.UP_PRICE:
        order = { maxPrice: 'DESC' };
        break;
      case MerchantGoodsOrderTypeEnum.DOWN_PRICE:
        order = { minPrice: 'ASC' };
        break;
      default:
        order = { order: 'ASC' };
    }
    const queryCondition = ids?.length ? { id: In(ids) } : {};
    const result = await this.goodsEntityService.findAndCount({
      relations: ['category'], // 确定关联字段不为空的情况，才可以使用 relations
      select: [
        'name',
        'sellingPoint',
        'thumbnailId',
        'specType',
        'salesInitial',
        'salesActual',
        'isPointsDiscount',
        'maxPointsDiscountAmount',
        'isPointsGift',
        'isEnableGrade',
        'isActive',
        'categoryId',
        'deliveryId',
        'prizeGetMethods',
        'order',
        'maxPrice',
        'minPrice',
        'type',
        'limit',
        'unit',
        'giftCouponId',
      ],
      where: {
        ...queryCondition,
        categoryId,
        merchantId,
        type,
        isActive,
        name_contains: name,
      },
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      order,
    });
    await Promise.all([
      this.specService.bindGoodsSpecList(result.rows),
      this.specService.bindGoodsSkuList(result.rows),
      this.resourceService.bindTargetResource(
        result.rows,
        'thumbnail',
        'thumbnailId',
      ),
    ]);
    return {
      rows: this.clearExtraFields(result.rows, true),
      count: result.count,
    };
  }

  /**
   * 新增商品
   * @param param0
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async create(
    { goods, imageIds, specIds, skus }: ModifyMerchantGoodsDTO,
    { user, merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantGoodsEntity)
    goodsRepo?: Repository<MerchantGoodsEntity>,
    @TransactionRepository(MerchantGoodsSpecMappingEntity)
    specMappingRepo?: Repository<MerchantGoodsSpecMappingEntity>,
    @TransactionRepository(MerchantGoodsSkuEntity)
    goodsSkuRepo?: Repository<MerchantGoodsSkuEntity>,
  ) {
    const goodsEntityService = this.getService<
      MerchantGoodsEntity,
      OrmService<MerchantGoodsEntity>
    >(goodsRepo);
    const goodsSkuEntityService = this.getService<
      MerchantGoodsSkuEntity,
      OrmService<MerchantGoodsSkuEntity>
    >(goodsSkuRepo);
    const specMappingEntityService = this.getService<
      MerchantGoodsSpecMappingEntity,
      OrmService<MerchantGoodsSpecMappingEntity>
    >(specMappingRepo);
    const maxPrice = Math.max(...skus.map(sku => sku.price));
    const minPrice = Math.min(...skus.map(sku => sku.price));
    const goodsInfo = await goodsEntityService.create(
      {
        ...goods,
        merchantId,
        maxPrice,
        minPrice,
      },
      user.id,
    );
    await goodsRepo
      .createQueryBuilder()
      .relation(MerchantGoodsEntity, 'images')
      .of(goodsInfo.id)
      .add(imageIds);
    if (goods.specType === MerchantGoodsSpecTypeEnum.MULTI && specIds?.length) {
      await specMappingEntityService.createMany(
        specIds.map(item => ({
          ...item,
          merchantId,
          goodsId: goodsInfo.id,
        })),
        user.id,
      );
    }
    await goodsSkuEntityService.createMany(
      skus.map(sku => ({
        ...sku,
        goodsId: goodsInfo.id,
        merchantId,
      })),
      user.id,
    );
    return true;
  }

  /**
   * 修改商品
   * @param id
   * @param param0
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async update(
    id: number,
    { goods, imageIds, specIds, skus }: ModifyMerchantGoodsDTO,
    { user, merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantGoodsEntity)
    goodsRepo?: Repository<MerchantGoodsEntity>,
    @TransactionRepository(MerchantGoodsSpecMappingEntity)
    specMappingRepo?: Repository<MerchantGoodsSpecMappingEntity>,
    @TransactionRepository(MerchantGoodsSkuEntity)
    goodsSkuRepo?: Repository<MerchantGoodsSkuEntity>,
  ) {
    const goodsEntityService = this.getService<
      MerchantGoodsEntity,
      OrmService<MerchantGoodsEntity>
    >(goodsRepo);
    const goodsSkuEntityService = this.getService<
      MerchantGoodsSkuEntity,
      OrmService<MerchantGoodsSkuEntity>
    >(goodsSkuRepo);
    const specMappingEntityService = this.getService<
      MerchantGoodsSpecMappingEntity,
      OrmService<MerchantGoodsSpecMappingEntity>
    >(specMappingRepo);
    const goodsInfo = await goodsEntityService.findOne({
      select: ['id'],
      where: { merchantId, id },
    });
    if (!goodsInfo) {
      throw new GetMerchantGoodsDetailFailedException({
        error: '该商户下不存在该商品',
      });
    }
    await this.resourceService.bindTargetResourceList(
      goodsInfo,
      this.goodsEntityService.repository,
      'images',
    );
    const removeImages = goodsInfo.images.map(img => img.id);
    const maxPrice = Math.max(...skus.map(sku => sku.price));
    const minPrice = Math.min(...skus.map(sku => sku.price));
    await goodsEntityService.update(
      { ...goods, maxPrice, minPrice },
      { id, merchantId },
      user.id,
    );
    await goodsRepo
      .createQueryBuilder()
      .relation(MerchantGoodsEntity, 'images')
      .of(id)
      .addAndRemove(imageIds, removeImages);
    await specMappingRepo.delete({
      merchantId,
      goodsId: id,
    });
    if (goods.specType === MerchantGoodsSpecTypeEnum.MULTI && specIds?.length) {
      await specMappingEntityService.createMany(
        specIds.map(item => ({
          ...item,
          merchantId,
          goodsId: goodsInfo.id,
        })),
        user.id,
      );
    }
    await goodsSkuRepo.delete({
      merchantId,
      goodsId: id,
    });
    await goodsSkuEntityService.createMany(
      skus.map(sku => ({
        ...sku,
        goodsId: goodsInfo.id,
        merchantId,
      })),
      user.id,
    );
    // 清除商品详情缓存
    await this.clearDetailCache(id, merchantId);
    return true;
  }

  /**
   * 删除商品
   * @param id
   * @param param1
   */
  async delete(id: number, { user, merchantId }: MerchantIdentity) {
    await this.goodsEntityService.delete({ id, merchantId }, user.id);
    // 清除商品详情缓存
    await this.clearDetailCache(id, merchantId);
    return true;
  }

  /**
   * 上架/下架商品
   * @param id
   * @param isActive
   * @param param2
   */
  async active(
    id: number,
    isActive: MerchantGoodsIsActiveEnum,
    { user, merchantId }: MerchantIdentity,
  ) {
    await this.goodsEntityService.update(
      { isActive },
      {
        id,
        merchantId,
      },
      user.id,
    );
    // 清除商品详情缓存
    await this.clearDetailCache(id, merchantId);
    return true;
  }
}
