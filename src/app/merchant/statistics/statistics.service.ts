import { Injectable } from '@nestjs/common';
import { Between, InjectService } from '@jiaxinjiang/nest-orm';
import {
  MerchantGameWinningEntity,
  MerchantGoodsEntity,
  MerchantMenuOrderEntity,
  MerchantMenuOrderStatusEnum,
  MerchantOrderEntity,
  MerchantOrderStatusEnum,
  MerchantUserEntity,
  MerchantGameOrderEntity,
  MerchantGameOrderPayTypeEnum,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import { OrmService } from '@typeorm/orm.service';
import {
  MerchantStatisticsTimeSlotDTO,
  MerchantStatisticsSaleVolumeRespDTO,
  MerchantStatisticsBaseCountRespDTO,
} from './statistics.dto';

@Injectable()
export class MerchantStatisticsService extends BaseService {
  constructor(
    @InjectService(MerchantUserEntity)
    private userEntityService: OrmService<MerchantUserEntity>,
    @InjectService(MerchantGoodsEntity)
    private goodsEntityService: OrmService<MerchantGoodsEntity>,
    @InjectService(MerchantOrderEntity)
    private orderEntityService: OrmService<MerchantOrderEntity>,
    @InjectService(MerchantMenuOrderEntity)
    private menuOrderEntityService: OrmService<MerchantMenuOrderEntity>,
    @InjectService(MerchantGameWinningEntity)
    private gameWinningEntityService: OrmService<MerchantGameWinningEntity>,
    @InjectService(MerchantGameOrderEntity)
    private gameOrderEntityService: OrmService<MerchantGameOrderEntity>,
  ) {
    super();
  }

  /**
   * 获取商家基础数量统计
   * @param merchantId
   * @returns
   */
  async getBaseCount(
    { startTime, endTime }: MerchantStatisticsTimeSlotDTO,
    merchantId: number,
  ): Promise<MerchantStatisticsBaseCountRespDTO> {
    const condition = {
      createdAt: undefined,
      createdAt_lte: undefined,
    };
    if (startTime) {
      condition.createdAt = Between(startTime, endTime || new Date());
    } else {
      condition.createdAt_lte = endTime;
    }
    const [
      userCount,
      winningCount,
      orderCount,
      menuOrderCount,
      goodsCount,
    ] = await Promise.all([
      // 获取商家用户总数
      this.userEntityService.count({
        merchantId,
        ...condition,
      }),
      // 获取商家获奖订单总数
      this.gameWinningEntityService.count({
        merchantId,
        ...condition,
      }),
      // 获取商家已完成商城订单总数
      this.orderEntityService.count({
        merchantId,
        orderStatus: MerchantOrderStatusEnum.SUCCESS,
        ...condition,
      }),
      // 获取商家已完成点餐订单总数
      this.menuOrderEntityService.count({
        merchantId,
        orderStatus: MerchantMenuOrderStatusEnum.SUCCESS,
        ...condition,
      }),
      // 获取商家商品总数
      this.goodsEntityService.count({
        merchantId,
      }),
    ]);
    return {
      userCount,
      winningCount,
      orderCount,
      menuOrderCount,
      goodsCount,
    };
  }

  /**
   * 获取商家销售额统计
   * @param param0
   * @param merchantId
   * @returns
   */
  async getSalesVolume(
    {
      startTime = new Date(2000, 1, 1),
      endTime = new Date(),
    }: MerchantStatisticsTimeSlotDTO,
    merchantId: number,
  ): Promise<MerchantStatisticsSaleVolumeRespDTO> {
    const merchantCondition = {
      where: 'merchant_id = :merchantId',
      params: { merchantId },
    };
    const orderStatusCondition = {
      where: 'order_status = :orderStatus',
      params: { orderStatus: MerchantOrderStatusEnum.SUCCESS },
    };
    const gamePayTypeCondition = {
      where: 'pay_type != :payType',
      params: { payType: MerchantGameOrderPayTypeEnum.NULL },
    };
    const startTimeCondition = {
      where: 'created_at >= :startTime',
      params: {
        startTime,
      },
    };
    const endTimeCondition = {
      where: 'created_at <= :endTime',
      params: {
        endTime,
      },
    };
    const groupByField = 'days';
    const selectDaysField = [
      "DATE_FORMAT(created_at,'%Y-%m-%d')",
      groupByField,
    ];
    const selectPayPriceField = ['SUM(pay_price)', 'sum'];
    const selectPriceField = ['SUM(price)', 'sum'];
    const [
      menuOrderSalesVolume,
      orderSalesVolume,
      gameOrderSalesVolume,
    ] = await Promise.all([
      this.menuOrderEntityService.repository
        .createQueryBuilder()
        .where(merchantCondition.where, merchantCondition.params)
        .andWhere(orderStatusCondition.where, orderStatusCondition.params)
        .andWhere(startTimeCondition.where, startTimeCondition.params)
        .andWhere(endTimeCondition.where, endTimeCondition.params)
        .select(selectDaysField[0], selectDaysField[1])
        .addSelect(selectPayPriceField[0], selectPayPriceField[1])
        .groupBy(groupByField)
        .getRawMany(),
      this.orderEntityService.repository
        .createQueryBuilder()
        .where(merchantCondition.where, merchantCondition.params)
        .andWhere(orderStatusCondition.where, orderStatusCondition.params)
        .andWhere(startTimeCondition.where, startTimeCondition.params)
        .andWhere(endTimeCondition.where, endTimeCondition.params)
        .select(selectDaysField[0], selectDaysField[1])
        .addSelect(selectPayPriceField[0], selectPayPriceField[1])
        .groupBy(groupByField)
        .getRawMany(),
      this.gameOrderEntityService.repository
        .createQueryBuilder()
        .where(merchantCondition.where, merchantCondition.params)
        .andWhere(gamePayTypeCondition.where, gamePayTypeCondition.params)
        .andWhere(startTimeCondition.where, startTimeCondition.params)
        .andWhere(endTimeCondition.where, endTimeCondition.params)
        .select(selectDaysField[0], selectDaysField[1])
        .addSelect(selectPriceField[0], selectPriceField[1])
        .groupBy(groupByField)
        .getRawMany(),
    ]);
    return {
      orderSalesVolume,
      menuOrderSalesVolume,
      gameOrderSalesVolume,
    };
  }
}
