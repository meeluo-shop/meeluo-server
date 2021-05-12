import { Inject, Injectable } from '@nestjs/common';
import {
  MerchantGoodsEntity,
  MerchantDeliveryEntity,
  MerchantDeliveryRuleEntity,
  MerchantDeliveryMethodEnum,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  ModifyMerchantDeliveryDTO,
  MerchantDeliveryListDTO,
} from './delivery.dto';
import {
  Transaction,
  Repository,
  TransactionRepository,
  InjectService,
  In,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { OrmService } from '@typeorm/orm.service';
import { DeleteMerchantDeliveryFailedException } from './delivery.exception';
import { MerchantDeliverySettingService } from './setting';
import { MerchantDeliveryCombinationEnum } from './setting/setting.enum';
import { MathHelperProvider } from '@shared/helper';

@Injectable()
export class MerchantDeliveryService extends BaseService {
  constructor(
    @Inject(MerchantDeliverySettingService)
    private deliverySettingService: MerchantDeliverySettingService,
    @InjectService(MerchantGoodsEntity)
    private goodsEntityService: OrmService<MerchantGoodsEntity>,
    @InjectService(MerchantDeliveryEntity)
    private deliveryEntityService: OrmService<MerchantDeliveryEntity>,
  ) {
    super();
  }

  /**
   * 获取运费模板列表
   * @param param0
   * @param param1
   */
  async list(
    { pageIndex, pageSize }: MerchantDeliveryListDTO,
    { merchantId }: MerchantIdentity,
  ) {
    return this.deliveryEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        merchantId,
      },
      order: {
        order: 'ASC',
      },
    });
  }

  /**
   * 获取运费模板详情
   * @param id
   * @param param1
   */
  async detail(id: number, { merchantId }: MerchantIdentity) {
    const result = await this.deliveryEntityService.findOne({
      relations: ['rules'], // 确定关联字段不为空的情况，才可以使用 relations
      where: {
        id,
        merchantId,
      },
    });
    return this.clearExtraFields(result, true);
  }

  /**
   * 创建运费模板
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async create(
    data: ModifyMerchantDeliveryDTO,
    { user, merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantDeliveryEntity)
    deliveryRepo?: Repository<MerchantDeliveryEntity>,
    @TransactionRepository(MerchantDeliveryRuleEntity)
    deliveryRuleRepo?: Repository<MerchantDeliveryRuleEntity>,
  ) {
    const deliveryEntityService = this.getService<
      MerchantDeliveryEntity,
      OrmService<MerchantDeliveryEntity>
    >(deliveryRepo);
    const ruleEntityService = this.getService<
      MerchantDeliveryRuleEntity,
      OrmService<MerchantDeliveryRuleEntity>
    >(deliveryRuleRepo);
    const deliveryInfo = await deliveryEntityService.create(
      {
        ...data,
        merchantId,
      },
      user.id,
    );
    await ruleEntityService.createMany(
      data.rules.map(rule => ({
        ...rule,
        merchantId,
        deliveryId: deliveryInfo.id,
      })),
      user.id,
    );
    return true;
  }

  /**
   * 修改运费模板
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async update(
    id: number,
    data: ModifyMerchantDeliveryDTO,
    { user, merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantDeliveryEntity)
    deliveryRepo?: Repository<MerchantDeliveryEntity>,
    @TransactionRepository(MerchantDeliveryRuleEntity)
    deliveryRuleRepo?: Repository<MerchantDeliveryRuleEntity>,
  ) {
    const deliveryEntityService = this.getService<
      MerchantDeliveryEntity,
      OrmService<MerchantDeliveryEntity>
    >(deliveryRepo);
    const ruleEntityService = this.getService<
      MerchantDeliveryRuleEntity,
      OrmService<MerchantDeliveryRuleEntity>
    >(deliveryRuleRepo);
    const rules = data.rules;
    delete data.rules;
    await deliveryEntityService.update(
      {
        ...data,
      },
      {
        id,
        merchantId,
      },
      user.id,
    );
    await deliveryRuleRepo.delete({
      deliveryId: id,
      merchantId,
    });
    await ruleEntityService.createMany(
      rules.map(rule => ({
        ...rule,
        merchantId,
        deliveryId: id,
      })),
      user.id,
    );
    return true;
  }

  /**
   * 删除运费模板
   * @param id
   * @param param1
   * @param deliveryRepo
   * @param deliveryRuleRepo
   */
  async delete(id: number, { user, merchantId }: MerchantIdentity) {
    const goodsCount = await this.goodsEntityService.count({
      merchantId,
      deliveryId: id,
    });
    if (goodsCount) {
      throw new DeleteMerchantDeliveryFailedException({
        msg: `该运费模板有${goodsCount}件商品正在使用，请先修改后再删除`,
      });
    }
    await this.deliveryEntityService.delete(
      {
        id,
        merchantId,
      },
      user.id,
    );
    return true;
  }

  /**
   * 绑定商品对应的物流信息
   * @param targets
   */
  async bindGoodsDelivery(
    entitys: MerchantGoodsEntity,
  ): Promise<MerchantGoodsEntity>;
  async bindGoodsDelivery(
    entitys: MerchantGoodsEntity[],
  ): Promise<MerchantGoodsEntity[]>;
  async bindGoodsDelivery(
    entitys: MerchantGoodsEntity | MerchantGoodsEntity[],
  ) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const deliveryIds = Array.from(
      new Set(targets.map(item => item.deliveryId)),
    );
    const deliveryList = await this.deliveryEntityService.find({
      relations: ['rules'],
      where: { id: In(deliveryIds.length ? deliveryIds : [null]) },
    });
    targets.forEach(target => {
      target.delivery =
        deliveryList.find(item => item.id === target.deliveryId) || null;
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 验证用户收货地址是否在配送范围
   * @return bool
   */
  isIntraRegion(cityId: string, delivery: MerchantDeliveryEntity) {
    if (!cityId || !delivery?.rules?.length) {
      return false;
    }
    for (const rule of delivery.rules) {
      if (`,${rule.regions},`.indexOf(`,${cityId},`) > -1) {
        return true;
      }
    }
    return false;
  }

  /**
   * 计算配送模板的运费
   * @param goods
   */
  async calcDeliveryAmount(
    cityId: string,
    goodsList: Array<MerchantGoodsEntity & { goodsNum: number }>,
    deliveryList: MerchantDeliveryEntity[],
    merchantId: number,
  ) {
    const deliveryFeeList: number[] = [];
    // 获取运费模板下商品总数量or总重量
    const itemGoodsTotals = this.getItemGoodsTotal(goodsList, deliveryList);
    // 收货城市配送规则
    const cityDeliveryRules = this.getCityDeliveryRule(cityId, deliveryList);
    for (const { rule, deliveryId } of cityDeliveryRules) {
      const goodsTotal = itemGoodsTotals.find(
        val => val.deliveryId === deliveryId,
      );
      if (!rule || !goodsTotal) {
        continue;
      }
      const totality =
        goodsTotal.method === MerchantDeliveryMethodEnum.WEIGHT
          ? goodsTotal.totalWeight
          : goodsTotal.totalNum;
      // 判断低于首件or首重
      if (totality <= rule.first) {
        deliveryFeeList.push(Number(rule.firstFee));
        continue;
      }
      // 判断超出首件or首重，但不超过续件or续重
      const additional = MathHelperProvider.subtract(totality, rule.first);
      if (additional <= rule.additional) {
        deliveryFeeList.push(
          MathHelperProvider.add(rule.firstFee, rule.additionalFee),
        );
        continue;
      }
      if (rule.additional < 1) {
        // 配送规则中续件为0
        deliveryFeeList.push(Number(rule.firstFee));
        continue;
      }
      const additionalFee = MathHelperProvider.multiply(
        MathHelperProvider.divide(rule.additionalFee, rule.additional),
        additional,
      );
      deliveryFeeList.push(
        MathHelperProvider.add(rule.firstFee, additionalFee),
      );
    }
    return this.getFinalFreight(deliveryFeeList, merchantId);
  }

  /**
   * 根据运费组合策略 计算最终运费
   */
  async getFinalFreight(deliveryFeeList: number[], merchantId: number) {
    if (!deliveryFeeList.length) {
      return 0;
    }
    const deliverySetting = await this.deliverySettingService.getSetting(
      merchantId,
    );
    // 判断运费组合策略
    switch (deliverySetting?.combination) {
      // 策略1: 叠加
      case MerchantDeliveryCombinationEnum.TOTAL:
        return deliveryFeeList.reduce((a, b) => MathHelperProvider.add(a, b));
      // 策略2: 以最低运费结算
      case MerchantDeliveryCombinationEnum.MIN:
        return deliveryFeeList.sort((a, b) =>
          MathHelperProvider.subtract(a, b),
        )[0];
      // 策略3: 以最高运费结算
      case MerchantDeliveryCombinationEnum.MAX:
        return deliveryFeeList.sort((a, b) =>
          MathHelperProvider.subtract(b, a),
        )[0];
      default:
        return 0;
    }
  }

  /**
   * 获取运费模板下商品总数量or总重量
   */
  getItemGoodsTotal(
    goodsList: Array<MerchantGoodsEntity & { goodsNum: number }>,
    deliveryList: MerchantDeliveryEntity[],
  ) {
    const deliveryTotalList: Array<{
      deliveryId: number;
      totalWeight: number; // 总重量
      totalNum: number; // 总数量
      method: MerchantDeliveryMethodEnum; // 计费方式
    }> = [];
    for (const delivery of deliveryList) {
      const deliveryTotalItem = {
        deliveryId: delivery.id,
        totalWeight: 0,
        totalNum: 0,
        method: delivery.method,
      };
      for (const goods of goodsList) {
        if (goods.deliveryId !== delivery.id) {
          continue;
        }
        const goodsWeight = MathHelperProvider.multiply(
          goods.skus[0]?.weight || 0,
          goods.goodsNum,
        );
        deliveryTotalItem.totalWeight = MathHelperProvider.add(
          deliveryTotalItem.totalWeight,
          goodsWeight,
        ) as number;
        deliveryTotalItem.totalNum = MathHelperProvider.add(
          deliveryTotalItem.totalNum,
          goods.goodsNum || 0,
        ) as number;
      }
      deliveryTotalList.push(deliveryTotalItem);
    }
    return deliveryTotalList;
  }

  /**
   * 根据城市id获取规则信息
   * @param
   */
  getCityDeliveryRule(cityId: string, deliveryList: MerchantDeliveryEntity[]) {
    const deliveryRules: Array<{
      deliveryId: number;
      rule: MerchantDeliveryRuleEntity | null;
    }> = [];
    for (const delivery of deliveryList) {
      let deliveryRule: MerchantDeliveryRuleEntity | null = null;
      for (const rule of delivery.rules) {
        if (`,${rule.regions},`.indexOf(`,${cityId},`) > -1) {
          deliveryRule = rule;
        }
      }
      deliveryRules.push({
        deliveryId: delivery.id,
        rule: deliveryRule,
      });
    }
    return deliveryRules;
  }
}
