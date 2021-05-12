import { Injectable } from '@nestjs/common';
import {
  MerchantGoodsSpecEntity,
  MerchantGoodsSpecValueEntity,
  MerchantGoodsEntity,
  MerchantGoodsSpecMappingEntity,
  MerchantGoodsSkuEntity,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  Transaction,
  TransactionRepository,
  Repository,
  InjectService,
  In,
} from '@jiaxinjiang/nest-orm';
import {
  AddMerchantGoodsSpecDTO,
  AddMerchantGoodsSpecRespDTO,
} from './spec.dto';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { OrmService } from '@typeorm/orm.service';

@Injectable()
export class MerchantGoodsSpecService extends BaseService {
  constructor(
    @InjectService(MerchantGoodsSpecMappingEntity)
    private specMappingEntityService: OrmService<
      MerchantGoodsSpecMappingEntity
    >,
    @InjectService(MerchantGoodsSkuEntity)
    private goodsSkuEntityService: OrmService<MerchantGoodsSkuEntity>,
  ) {
    super();
  }

  /**
   * 新增商品规格
   * @param param0
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async create(
    { name, value }: AddMerchantGoodsSpecDTO,
    { user, merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantGoodsSpecEntity)
    specRepo?: Repository<MerchantGoodsSpecEntity>,
    @TransactionRepository(MerchantGoodsSpecValueEntity)
    specValueRepo?: Repository<MerchantGoodsSpecValueEntity>,
  ): Promise<AddMerchantGoodsSpecRespDTO> {
    const specEntityService = this.getService<
      MerchantGoodsSpecEntity,
      OrmService<MerchantGoodsSpecEntity>
    >(specRepo);
    const specValueEntityService = this.getService<
      MerchantGoodsSpecValueEntity,
      OrmService<MerchantGoodsSpecValueEntity>
    >(specValueRepo);
    // 判断规格名称是否存在
    const specInfo = await specEntityService.findOne({
      select: ['id'],
      where: {
        name,
        merchantId,
      },
    });
    if (!specInfo) {
      const spec = await specEntityService.create(
        { name, merchantId },
        user.id,
      );
      const specValue = await specValueEntityService.create(
        {
          spec,
          value,
          merchantId,
        },
        user.id,
      );
      return new AddMerchantGoodsSpecRespDTO(spec.id, specValue.id);
    }
    // 判断规格值是否存在
    const specValueInfo = await specValueEntityService.findOne({
      select: ['id'],
      where: {
        specId: specInfo.id,
        value,
        merchantId,
      },
    });
    if (specValueInfo) {
      return new AddMerchantGoodsSpecRespDTO(specInfo.id, specValueInfo.id);
    }
    const specValue = await specValueEntityService.create(
      {
        specId: specInfo.id,
        value,
        merchantId,
      },
      user.id,
    );
    return new AddMerchantGoodsSpecRespDTO(specInfo.id, specValue.id);
  }

  /**
   * 绑定商品下的规格信息
   * @param entitys
   */
  async bindGoodsSpecList(
    entitys: MerchantGoodsEntity,
  ): Promise<MerchantGoodsEntity>;
  async bindGoodsSpecList(
    entitys: MerchantGoodsEntity[],
  ): Promise<MerchantGoodsEntity[]>;
  async bindGoodsSpecList(
    entitys: MerchantGoodsEntity | MerchantGoodsEntity[],
  ): Promise<MerchantGoodsEntity | MerchantGoodsEntity[]> {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const goodsIds = Array.from(new Set(targets.map(item => item.id)));
    const specMappings = await this.specMappingEntityService.find({
      relations: ['spec', 'specValue'], // 确定关联字段不为空的情况，才可以使用 relations
      where: {
        goodsId: In(goodsIds),
      },
    });
    targets.forEach(goods => {
      goods.specMappings = goods.specMappings || [];
      specMappings.forEach(mapping => {
        if (mapping.goodsId === goods.id) {
          goods.specMappings.push(mapping);
        }
      });
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 绑定商品下的规格参数信息
   * @param entitys
   */
  async bindGoodsSkuList(
    entitys: MerchantGoodsEntity,
  ): Promise<MerchantGoodsEntity>;
  async bindGoodsSkuList(
    entitys: MerchantGoodsEntity[],
  ): Promise<MerchantGoodsEntity[]>;
  async bindGoodsSkuList(
    entitys: MerchantGoodsEntity | MerchantGoodsEntity[],
  ): Promise<MerchantGoodsEntity | MerchantGoodsEntity[]> {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const goodsIds = Array.from(new Set(targets.map(item => item.id)));
    const skus = await this.goodsSkuEntityService.find({
      where: {
        goodsId: In(goodsIds),
      },
    });
    targets.forEach(goods => {
      goods.skus = goods.skus || [];
      skus.forEach(sku => {
        if (sku.goodsId === goods.id) {
          goods.skus.push(sku);
          goods.skus.sort((a, b) => Number(a.price) - Number(b.price));
        }
      });
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }
}
