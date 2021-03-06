import * as QS from 'querystring';
import { FastifyRequest } from 'fastify';
import { BaseService } from '@app/app.service';
import { DeepPartial, Not } from 'typeorm';
import {
  InjectService,
  Repository,
  Transaction,
  TransactionRepository,
} from '@jiaxinjiang/nest-orm';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';
import { Inject, Injectable } from '@nestjs/common';
import {
  MerchantUserEntity,
  MerchantTableEntity,
  MerchantGoodsEntity,
  MerchantGoodsSkuEntity,
  MerchantMenuOrderPayTypeEnum,
  MerchantMenuOrderEntity,
  MerchantMenuOrderGoodsEntity,
  MerchantUserPointsModifyTypeEnum,
  MerchantUserBalanceLogEntity,
  MerchantMenuOrderPayStatusEnum,
  MerchantMenuOrderStatusEnum,
  MerchantUserPointsLogEntity,
  MerchantUserBalanceModifyTypeEnum,
  MerchantUserBalanceLogSceneEnum,
  WechatPaymentOrderSceneEnum,
  MerchantMenuOrderDeliveryStatusEnum,
  WechatPaymentOrderTradeStateEnum,
  MerchantMenuOrderReceiptStatusEnum,
  MerchantGoodsIsPointsGiftEnum,
  MerchantCouponGrantEntity,
  MerchantCouponTypeEnum,
  MerchantCouponIsUsedEnum,
} from '@typeorm/meeluoShop';
import { MerchantWechatTemplateService } from '@app/merchant/wechat/template';
import { OrmService } from '@typeorm/orm.service';
import { UserLock } from '@core/decorator';
import {
  ClientRechargeService,
  ClientRechargeWechatPayFailedException,
} from '../recharge';
import {
  ClientMenuOrderListDTO,
  ClientMenuOrderPaySignData,
  ClientMenuOrderSubmitDTO,
  ClientMenuOrderSubmitRespDTO,
} from './menu.dto';
import {
  ClientMenuOrderInvalidTableException,
  ClientMenuOrderSubmitException,
  ClientMenuOrderPayLockedException,
  ClientMenuOrderPaymentException,
  ClientMenuOrderCancelException,
  ClientMenuOrderInvaildPaymentOrderIdException,
} from './menu.exception';
import { MerchantGoodsService } from '@app/merchant/goods';
import { CLIENT_ORDER_PAY_LOCK_PREFIX } from '@core/constant';
import { MerchantUserService } from '@app/merchant/user';
import { ClientPointsSettingService } from '../points/setting';
import { UtilHelperProvider, MathHelperProvider } from '@shared/helper';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantPointsSettingDTO } from '@app/merchant/points';
import { MerchantOrderService } from '@app/merchant/order';
import {
  MerchantMenuOrderService,
  MerchantMenuOrderGoodsInfo,
} from '@app/merchant/menu/order';
import {
  MerchantMenuSettingService,
  MerchantMenuPayTypeEnum,
} from '@app/merchant/menu/setting';
import { OrderMessageTypeEnum } from '@app/consumer/order/order.dto';
import { MerchantCouponService } from '@app/merchant/coupon';

@Injectable()
export class ClientMenuService extends BaseService {
  constructor(
    @InjectLogger(ClientMenuService)
    private logger: LoggerProvider,
    @Inject(MerchantUserService)
    private merchantUserService: MerchantUserService,
    @Inject(MerchantCouponService)
    private merchantCouponService: MerchantCouponService,
    @Inject(MerchantMenuOrderService)
    private merchantMenuOrderService: MerchantMenuOrderService,
    @Inject(ClientRechargeService)
    private rechargeService: ClientRechargeService,
    @Inject(MerchantWechatTemplateService)
    private wechatTemplateService: MerchantWechatTemplateService,
    @Inject(ClientPointsSettingService)
    private pointsSettingService: ClientPointsSettingService,
    @Inject(MerchantOrderService)
    private merchantOrderService: MerchantOrderService,
    @Inject(MerchantGoodsService)
    private merchantGoodsService: MerchantGoodsService,
    @Inject(MerchantMenuSettingService)
    private merchantMenuSettingService: MerchantMenuSettingService,
    @InjectService(MerchantUserEntity)
    private userEntityService: OrmService<MerchantUserEntity>,
    @InjectService(MerchantMenuOrderEntity)
    private orderEntityService: OrmService<MerchantMenuOrderEntity>,
    @InjectService(MerchantMenuOrderGoodsEntity)
    private orderGoodsEntityService: OrmService<MerchantMenuOrderGoodsEntity>,
  ) {
    super();
  }

  /**
   * ????????????????????????
   */
  async list(
    { pageSize, pageIndex, status }: ClientMenuOrderListDTO,
    { userId, merchantId }: ClientIdentity,
  ) {
    return this.merchantMenuOrderService.list(
      { pageSize, pageIndex, status, userId },
      merchantId,
    );
  }

  /**
   * ??????????????????
   */
  async detail(id: number, merchantId: number, userId?: number) {
    return this.merchantMenuOrderService.detail(id, merchantId, userId);
  }

  /**
   * ????????????
   * @param param0
   * @param param1
   * @param goodsRepo
   * @param goodsSkuRepo
   * @param orderRepo
   * @param orderGoodsRepo
   * @param orderAddressRepo
   * @param orderExtractRepo
   * @param userRepo
   * @param userPointsLogRepo
   * @param userBalanceLogRepo
   */
  @UserLock({
    prefix: CLIENT_ORDER_PAY_LOCK_PREFIX,
    error: ClientMenuOrderPayLockedException,
  })
  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async submit(
    {
      goodsSkus,
      usePointsDiscount,
      payType,
      remark,
      tableId,
      people,
      couponId,
    }: ClientMenuOrderSubmitDTO,
    identity: ClientIdentity,
    request: FastifyRequest,
    @TransactionRepository(MerchantGoodsEntity)
    goodsRepo?: Repository<MerchantGoodsEntity>,
    @TransactionRepository(MerchantGoodsSkuEntity)
    goodsSkuRepo?: Repository<MerchantGoodsSkuEntity>,
    @TransactionRepository(MerchantMenuOrderEntity)
    orderRepo?: Repository<MerchantMenuOrderEntity>,
    @TransactionRepository(MerchantMenuOrderGoodsEntity)
    orderGoodsRepo?: Repository<MerchantMenuOrderGoodsEntity>,
    @TransactionRepository(MerchantTableEntity)
    tableRepo?: Repository<MerchantTableEntity>,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserPointsLogEntity)
    userPointsLogRepo?: Repository<MerchantUserPointsLogEntity>,
    @TransactionRepository(MerchantUserBalanceLogEntity)
    userBalanceLogRepo?: Repository<MerchantUserBalanceLogEntity>,
    @TransactionRepository(MerchantCouponGrantEntity)
    couponGrantRepo?: Repository<MerchantCouponGrantEntity>,
  ): Promise<ClientMenuOrderSubmitRespDTO> {
    let couponMoney = 0;
    let coupon: MerchantCouponGrantEntity;
    const { merchantId, userId } = identity;
    const userEntityService = this.getService(userRepo);
    const tableEntityService = this.getService(tableRepo);
    const orderEntityService = this.getService(orderRepo);
    const orderGoodsEntityService = this.getService(orderGoodsRepo);
    const couponGrantEntityService = this.getService(couponGrantRepo);
    const goodsList = await this.merchantMenuOrderService.getOrderGoodsData(
      goodsSkus,
      merchantId,
    );
    if (couponId) {
      // ???????????????????????????
      coupon = await this.merchantCouponService.checkCoupon(
        couponId,
        userId,
        merchantId,
      );
    }
    // ????????????
    this.merchantMenuOrderService.validateGoodsStockNum(goodsList);
    const [userinfo, tableInfo] = await Promise.all([
      userEntityService.findOne({
        select: ['point', 'balance', 'gradeId', 'merchantId'],
        where: {
          id: userId,
          merchantId,
        },
      }),
      tableEntityService.findOne({
        where: {
          id: tableId,
          merchantId,
        },
      }),
    ]);
    if (!tableInfo) {
      throw new ClientMenuOrderInvalidTableException();
    }
    // ??????????????????
    await this.merchantMenuOrderService.setOrderGoodsGradeMoney(
      goodsList,
      userinfo,
    );
    // ???????????????????????????????????????
    for (const goods of goodsList) {
      goods.totalPrice = MathHelperProvider.multiply(
        goods.gradeGoodsPrice || goods.skus[0].price,
        goods.goodsNum,
      );
    }
    if (coupon) {
      // ?????????????????????
      couponMoney = this.setCouponFee(coupon, goodsList);
      // ????????????????????????????????????
      await couponGrantEntityService.updateById(
        {
          isUsed: MerchantCouponIsUsedEnum.TRUE,
        },
        coupon.id,
        userId,
      );
    }
    const [pointsSetting, orderSetting] = await Promise.all([
      // ???????????????????????????????????????
      this.pointsSettingService.getPointsSetting(merchantId),
      // ??????????????????????????????
      this.merchantMenuSettingService.getOrderSetting(merchantId),
    ]);
    let orderPointsDiscountNum = 0;
    let orderPointsDiscountAmount = 0;
    if (usePointsDiscount) {
      const data = this.setOrderPoints(pointsSetting, goodsList, userinfo);
      orderPointsDiscountNum = data.orderPointsDiscountNum;
      orderPointsDiscountAmount = data.orderPointsDiscountAmount;
    }
    // ???????????????????????????????????????
    const {
      orderGoodsPrice,
      goodsTotalPrice,
    } = this.merchantMenuOrderService.setOrderGoodsPayPrice(goodsList);
    // ????????????????????????
    const pointsBonus = this.getOrderPointsBonus(pointsSetting, goodsList);
    // ????????????/?????????
    const wareFee = MathHelperProvider.multiply(tableInfo.wareFee, people);
    const orderPayPrice = MathHelperProvider.add(orderGoodsPrice, wareFee) || 0;
    // ??????????????????
    if (payType === MerchantMenuPayTypeEnum.BALANCE) {
      if (userinfo.balance < orderPayPrice) {
        throw new ClientMenuOrderSubmitException({
          msg: '?????????????????????????????????????????????',
        });
      }
    }
    let paymentType: MerchantMenuOrderPayTypeEnum;
    let payStatus: MerchantMenuOrderPayStatusEnum =
      MerchantMenuOrderPayStatusEnum.NOT_PAID;
    switch (payType) {
      case MerchantMenuPayTypeEnum.WECHAT:
        paymentType = MerchantMenuOrderPayTypeEnum.WECHAT;
        break;
      case MerchantMenuPayTypeEnum.BALANCE:
        paymentType = MerchantMenuOrderPayTypeEnum.BALANCE;
        break;
      case MerchantMenuPayTypeEnum.OFFLINE:
        payStatus = MerchantMenuOrderPayStatusEnum.OFFLINE_PAY;
        paymentType = MerchantMenuOrderPayTypeEnum.WECHAT;
        break;
    }
    const rowNo = await this.merchantMenuOrderService.generateRowNo(merchantId);
    // ??????????????????
    const order = await orderEntityService.create(
      {
        people,
        rowNo,
        orderNo: UtilHelperProvider.generateOrderNo(),
        totalPrice: goodsTotalPrice,
        orderPrice: orderGoodsPrice,
        pointsMoney: orderPointsDiscountAmount,
        pointsNum: orderPointsDiscountNum,
        payPrice: orderPayPrice,
        buyerRemark: remark,
        couponMoney,
        couponId: coupon?.id || null,
        tableId,
        tableName: tableInfo.name,
        payStatus,
        payType: paymentType,
        pointsBonus,
        wareFee,
        merchantId,
        merchantUserId: userId,
      },
      userId,
    );

    // ????????????????????????
    order.orderGoodsList = await orderGoodsEntityService.createMany(
      goodsList.map(goods => ({
        merchantId,
        merchantUserId: userId,
        orderId: order.id,
        goodsId: goods.id,
        name: goods.name,
        sellingPoint: goods.sellingPoint,
        thumbnailUrl: goods.skus[0]?.image?.url || goods.thumbnail?.url,
        specType: goods.specType,
        content: goods.content,
        giftCouponId: goods.giftCouponId,
        couponMoney: goods.couponMoney,
        isPointsDiscount: goods.isPointsDiscount,
        maxPointsDiscountAmount: goods.maxPointsDiscountAmount,
        isEnableGrade: goods.isEnableGrade,
        isPointsGift: goods.isPointsGift,
        specSkuId: goods.skus[0].specSkuId,
        specs: goods.specs,
        goodsNo: goods.skus[0].number,
        goodsPrice: goods.skus[0].price,
        goodsLinePrice: goods.skus[0].linePrice,
        goodsWeight: goods.skus[0].weight,
        gradeRatio: goods.gradeRatio,
        gradeTotalMoney: goods.gradeTotalMoney,
        gradeGoodsMoney: goods.gradeGoodsPrice,
        pointsMoney: goods.pointsMoney,
        pointsNum: goods.pointsNum,
        pointsBonus: goods.pointsBonus,
        totalNum: goods.goodsNum,
        totalPrice: goods.totalPrice,
        totalPayPrice: goods.totalPayPrice,
      })),
      userId,
    );
    // ???????????????
    await Promise.all(
      goodsList.map(goods =>
        goodsSkuRepo.decrement(
          { id: goods.skus[0].id },
          'stock',
          goods.goodsNum,
        ),
      ),
    );
    // ???????????????????????????????????????
    if (usePointsDiscount && orderPointsDiscountNum > 0) {
      await this.merchantUserService.modifyUserPoints(
        userId,
        merchantId,
        orderPointsDiscountNum,
        MerchantUserPointsModifyTypeEnum.SUBTRACT,
        `?????????????????????${order.orderNo}`,
        null,
        {
          userRepo,
          userPointsLogRepo,
        },
        false,
      );
    }
    let paidOrder: MerchantMenuOrderEntity = null;
    let paySignData: ClientMenuOrderPaySignData = null;
    if (payType === MerchantMenuPayTypeEnum.BALANCE || order.payPrice <= 0) {
      // ????????????
      paidOrder = await this.goodsBalancePay(userId, merchantId, order, {
        userRepo,
        userPointsLogRepo,
        userBalanceLogRepo,
        orderRepo,
        goodsRepo,
      });
    } else if (payType === MerchantMenuPayTypeEnum.WECHAT) {
      // ??????????????????????????????
      paySignData = await this.genGoodsWechatPayOrder(
        order,
        request.ip,
        identity,
      );
      if (orderSetting.notPayAutoCancelMin > 0) {
        // ????????????????????????????????????????????????????????????????????????
        await this.merchantOrderService.pushOrderDelayTask(
          OrderMessageTypeEnum.AUTO_CANCEL_NOT_PAY_MENU_ORDER,
          {
            orderId: order.id,
            merchantId,
            userId,
          },
          orderSetting.notPayAutoCancelMin * 60 * 1000,
        );
      }
    } else if (payType === MerchantMenuPayTypeEnum.OFFLINE) {
      // ??????????????????????????????????????????????????????????????????????????????
      await this.merchantMenuOrderService.delayAutoCompleteOrder({
        orderId: order.id,
        userId,
        merchantId,
        orderSetting,
      });
      // ?????????????????????????????????
      await this.merchantMenuOrderService
        .sendSubmitMenuNotify({
          merchantId,
          order,
          orderGoodsList: order.orderGoodsList,
        })
        .catch(err => this.logger.error(err));
      // ??????????????????
      await this.merchantMenuOrderService.printOrder(
        order.id,
        merchantId,
        order,
      );
    }
    // ????????????????????????
    await Promise.all(
      Array.from(new Set(goodsList.map(val => val.id))).map(id =>
        this.merchantGoodsService.clearDetailCache(id, merchantId),
      ),
    );
    delete order.orderGoodsList;
    return {
      order: paidOrder || order,
      paySignData,
    };
  }

  /**
   * ?????????????????????
   * @param coupon
   * @param goodsList
   * @returns
   */
  setCouponFee(
    coupon: MerchantCouponGrantEntity,
    goodsList: MerchantMenuOrderGoodsInfo[],
  ) {
    // ????????????????????????
    let orderCouponDiscountAmount = 0;
    let orderTotalPrice = 0;
    let discountTemp = 0;
    let weightTemp = 0;

    // ???????????????????????????????????????????????????
    for (const goods of goodsList) {
      orderTotalPrice = MathHelperProvider.add(
        orderTotalPrice,
        goods.totalPrice,
      );
    }
    // ?????????????????????0
    if (orderTotalPrice <= 0) {
      return 0;
    }
    // ???????????????????????????????????????????????????
    if (orderTotalPrice < coupon.minPrice) {
      throw new ClientMenuOrderSubmitException({ msg: '??????????????????????????????' });
    }
    if (coupon.type === MerchantCouponTypeEnum.FULL_REDUCTION) {
      orderCouponDiscountAmount =
        coupon.reducePrice > orderTotalPrice
          ? orderTotalPrice
          : coupon.reducePrice;
    }
    if (coupon.type === MerchantCouponTypeEnum.DISCOUNT) {
      orderCouponDiscountAmount = MathHelperProvider.multiply(
        orderTotalPrice,
        MathHelperProvider.divide(100 - coupon.discount, 100),
      );
    }
    // ??????????????????????????????0
    if (orderCouponDiscountAmount <= 0) {
      return 0;
    }
    for (const index in goodsList) {
      const goods = goodsList[index];
      // ???????????????????????????
      if (Number(index) === goodsList.length - 1) {
        goods.weight = MathHelperProvider.subtract(1, weightTemp);
        goods.couponMoney = MathHelperProvider.subtract(
          orderCouponDiscountAmount,
          discountTemp,
        );
        continue;
      }
      // ???????????????????????????????????????
      goods.weight =
        Math.round((goods.totalPrice / orderTotalPrice) * 100) / 100;
      // ??????????????????????????????????????????????????????
      goods.couponMoney = Number(
        MathHelperProvider.multiply(
          orderCouponDiscountAmount,
          goods.weight,
        ).toFixed(2),
      );
      weightTemp = MathHelperProvider.add(weightTemp, goods.weight);
      discountTemp = MathHelperProvider.add(discountTemp, goods.couponMoney);
    }
    return orderCouponDiscountAmount;
  }

  /**
   * ??????????????????????????????
   * @return bool
   */
  setOrderPoints(
    pointsSetting: MerchantPointsSettingDTO,
    goodsList: MerchantMenuOrderGoodsInfo[],
    userinfo: MerchantUserEntity,
  ) {
    // ????????????????????????????????????
    let orderPointsDiscountAmount = 0;
    // ????????????????????????????????????
    let orderPointsDiscountNum = 0;
    // ???????????????????????????????????????
    let userMaxPointsDiscountAmount = MathHelperProvider.multiply(
      userinfo.point,
      pointsSetting.discountRatio,
    );
    for (const goods of goodsList) {
      if (!goods.isPointsDiscount || !goods.maxPointsDiscountAmount) {
        continue;
      }
      let maxPointsDiscountAmount = MathHelperProvider.multiply(
        goods.maxPointsDiscountAmount,
        goods.goodsNum,
      );
      const goodsTotalPrice = MathHelperProvider.subtract(
        goods.totalPrice,
        goods.couponMoney,
      );
      maxPointsDiscountAmount =
        maxPointsDiscountAmount > goodsTotalPrice
          ? goodsTotalPrice
          : maxPointsDiscountAmount;
      if (userMaxPointsDiscountAmount > 0) {
        userMaxPointsDiscountAmount = MathHelperProvider.subtract(
          userMaxPointsDiscountAmount,
          maxPointsDiscountAmount,
        );
        goods.pointsMoney =
          userMaxPointsDiscountAmount >= 0
            ? maxPointsDiscountAmount
            : MathHelperProvider.add(
                maxPointsDiscountAmount,
                userMaxPointsDiscountAmount,
              );
        goods.pointsNum = MathHelperProvider.divide(
          goods.pointsMoney,
          pointsSetting.discountRatio,
        );
        // ???????????????????????????
        if (
          parseInt(String(goods.pointsNum)) <
          parseFloat(String(goods.pointsNum))
        ) {
          // ????????????????????????
          goods.pointsNum = Math.floor(goods.pointsNum);
          // ?????????????????????????????????????????????????????????
          goods.pointsMoney = MathHelperProvider.multiply(
            goods.pointsNum,
            pointsSetting.discountRatio,
          );
          // ?????????????????????????????????
          userMaxPointsDiscountAmount = MathHelperProvider.subtract(
            MathHelperProvider.add(
              userMaxPointsDiscountAmount,
              maxPointsDiscountAmount,
            ),
            goods.pointsMoney,
          );
        }
      }
      orderPointsDiscountAmount = MathHelperProvider.add(
        orderPointsDiscountAmount,
        goods.pointsMoney,
      );
      orderPointsDiscountNum = MathHelperProvider.add(
        orderPointsDiscountNum,
        goods.pointsNum,
      );
    }
    return {
      orderPointsDiscountAmount,
      orderPointsDiscountNum,
    };
  }

  /**
   * ???????????????????????????
   * @param pointsSetting
   * @param goodsList
   */
  getOrderPointsBonus(
    pointsSetting: MerchantPointsSettingDTO,
    goodsList: MerchantMenuOrderGoodsInfo[],
  ) {
    // ???????????????????????????
    let giftPointsNum = 0;
    // ???????????? - ????????????
    for (const goods of goodsList) {
      if (goods.isPointsGift === MerchantGoodsIsPointsGiftEnum.FALSE) {
        continue;
      }
      // ??????????????????????????????????????????????????????????????????????????????????????????
      goods.pointsBonus = Math.ceil(
        MathHelperProvider.multiply(
          MathHelperProvider.multiply(
            goods.skus[0].price,
            pointsSetting.giftRatio,
          ),
          goods.goodsNum,
        ),
      );
      giftPointsNum = MathHelperProvider.add(giftPointsNum, goods.pointsBonus);
    }
    return giftPointsNum;
  }

  /**
   * ????????????
   * @param id
   * @param identity
   */
  async cancel(id: number, identity: ClientIdentity) {
    const { userId } = identity;
    const order = await this.orderEntityService.findOne({
      where: {
        id,
        merchantUserId: userId,
      },
    });
    if (!order) {
      throw new ClientMenuOrderCancelException({ msg: '???????????????' });
    }
    if (order.orderStatus !== MerchantMenuOrderStatusEnum.IN_PROCESS) {
      throw new ClientMenuOrderCancelException({ msg: '?????????????????????' });
    }
    if (order.payStatus === MerchantMenuOrderPayStatusEnum.NOT_PAID) {
      await this.cancelNotPayOrder(order);
    } else {
      await this.cancelPaidOrder(order);
    }
    return true;
  }

  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async wechatPaySuccess(
    identity: ClientIdentity,
    @TransactionRepository(MerchantGoodsEntity)
    goodsRepo?: Repository<MerchantGoodsEntity>,
    @TransactionRepository(MerchantMenuOrderEntity)
    orderRepo?: Repository<MerchantMenuOrderEntity>,
  ) {
    let attach: any = {};
    const { userId, merchantId } = identity;
    const wechatPayOrder = await this.rechargeService.queryWechatPayOrder({
      identity,
      repeat: 3,
      isConsume: true,
      consumeDesc: `??????????????????`,
    });
    if (
      !wechatPayOrder?.totalFee ||
      wechatPayOrder?.tradeState !== WechatPaymentOrderTradeStateEnum.SUCCESS
    ) {
      throw new ClientRechargeWechatPayFailedException();
    }
    if (wechatPayOrder.attach) {
      attach = QS.parse(wechatPayOrder.attach) || {};
    }
    const order = await this.orderEntityService.findOne({
      where: {
        id: attach.orderId || null,
        merchantUserId: userId,
      },
    });
    if (!order) {
      throw new ClientMenuOrderInvaildPaymentOrderIdException();
    }
    if (
      order.payStatus === MerchantMenuOrderPayStatusEnum.PAID ||
      order.orderStatus !== MerchantMenuOrderStatusEnum.IN_PROCESS
    ) {
      throw new ClientMenuOrderInvaildPaymentOrderIdException({
        msg: '?????????????????????',
      });
    }
    order.orderGoodsList = await this.orderGoodsEntityService.find({
      where: { orderId: order.id },
    });
    const orderEntityService = this.getService(orderRepo);
    const goodsSalesList: Array<{ id: number; total: number }> = [];
    order.orderGoodsList.forEach(goods => {
      const item = goodsSalesList.find(val => val.id === goods.goodsId);
      if (item) {
        item.total = MathHelperProvider.add(item.total, goods.totalNum);
      } else {
        goodsSalesList.push({ id: goods.goodsId, total: goods.totalNum });
      }
    });
    order.payType = MerchantMenuOrderPayTypeEnum.WECHAT;
    const modifyOrderData: DeepPartial<MerchantMenuOrderEntity> = {
      payType: MerchantMenuOrderPayTypeEnum.WECHAT,
      payStatus: MerchantMenuOrderPayStatusEnum.PAID,
      payTime: new Date(),
    };
    // ????????????????????????????????????
    if (
      order.deliveryStatus === MerchantMenuOrderDeliveryStatusEnum.DELIVERED
    ) {
      modifyOrderData.receiptStatus =
        MerchantMenuOrderReceiptStatusEnum.RECEIPTED;
      modifyOrderData.receiptTime = new Date();
      modifyOrderData.orderStatus = MerchantMenuOrderStatusEnum.SUCCESS;
    } else {
      // ???????????????????????????????????????????????????????????????????????????
      await this.merchantMenuOrderService.delayAutoCompleteOrder({
        orderId: order.id,
        userId,
        merchantId,
      });
    }
    // ??????????????????
    await orderEntityService.updateById(modifyOrderData, order.id, userId);
    // ??????????????????
    await Promise.all(
      goodsSalesList.map(item =>
        goodsRepo.increment(
          {
            id: item.id,
          },
          'salesActual',
          item.total,
        ),
      ),
    );
    if (order.payStatus === MerchantMenuOrderPayStatusEnum.OFFLINE_PAY) {
      // ?????????????????????????????????????????????
      await this.sendMenuPayNotify({
        merchantId,
        order,
        orderGoodsList: order.orderGoodsList,
      }).catch(err => this.logger.error(err));
    } else {
      // ???????????????????????????????????????
      await this.merchantMenuOrderService
        .sendSubmitMenuNotify({
          merchantId,
          order,
          orderGoodsList: order.orderGoodsList,
        })
        .catch(err => this.logger.error(err));
      // ??????????????????
      await this.merchantMenuOrderService.printOrder(
        order.id,
        merchantId,
        order,
      );
    }
    return true;
  }

  /**
   * ?????????????????????????????????
   * @param params
   */
  async sendMenuPayNotify(params: {
    merchantId: number;
    order: MerchantMenuOrderEntity;
    orderGoodsList: MerchantMenuOrderGoodsEntity[];
  }) {
    const { order, orderGoodsList, merchantId } = params;
    const goodsNames: string[] = [];
    orderGoodsList.forEach(goods => {
      goodsNames.push(`${goods.name}???${goods.specs}?????? ${goods.totalNum}`);
    });
    const surplusOrderNum = await this.orderEntityService.count({
      tableId: order.tableId,
      merchantId,
      orderStatus: MerchantMenuOrderStatusEnum.IN_PROCESS,
      payStatus: MerchantMenuOrderPayStatusEnum.OFFLINE_PAY,
      id: Not(order.id),
    });
    return this.wechatTemplateService.sendMenuPayNotifyStaff(
      {
        orderId: order.id,
        orderNo: order.orderNo,
        rowNo: order.rowNo,
        people: order.people,
        orderTime: order.createdAt,
        tableName: order.tableName,
        price: order.payPrice,
        payType: order.payType,
        payStatus: order.payStatus,
        menus: goodsNames.join('???'),
        surplusOrderNum: surplusOrderNum,
      },
      merchantId,
    );
  }

  /**
   * ??????????????????????????????
   */
  async cancelPaidOrder(order: MerchantMenuOrderEntity) {
    if (!order.id) {
      return false;
    }
    // ??????????????????
    await this.orderEntityService.updateById(
      {
        orderStatus: MerchantMenuOrderStatusEnum.WAIT_CANCEL,
      },
      order.id,
      order.merchantUserId,
    );
    // ???????????????????????????????????????
    await this.sendCancelMenuOrderMessage({
      orderId: order.id,
      orderNo: order.orderNo,
      userId: order.merchantUserId,
      merchantId: order.merchantId,
      amount: order.payPrice,
      refundType: order.payType,
    }).catch(err => this.logger.error(err));
    return true;
  }

  /**
   * ?????????????????????
   */
  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async cancelNotPayOrder(
    order: MerchantMenuOrderEntity,
    @TransactionRepository(MerchantGoodsSkuEntity)
    goodsSkuRepo?: Repository<MerchantGoodsSkuEntity>,
    @TransactionRepository(MerchantMenuOrderEntity)
    orderRepo?: Repository<MerchantMenuOrderEntity>,
    @TransactionRepository(MerchantMenuOrderGoodsEntity)
    orderGoodsRepo?: Repository<MerchantMenuOrderGoodsEntity>,
  ) {
    const orderEntityService = this.getService(orderRepo);
    if (!order.id) {
      return false;
    }
    if (!order.payStatus || !order.orderStatus) {
      order = await orderEntityService.findById(order.id);
    }
    if (
      order.payStatus !== MerchantMenuOrderPayStatusEnum.NOT_PAID ||
      order.orderStatus !== MerchantMenuOrderStatusEnum.IN_PROCESS
    ) {
      return false;
    }
    // ??????????????????
    await this.merchantMenuOrderService.goodsStockRollBack(
      order.id,
      order.merchantUserId,
      order.merchantId,
      {
        goodsSkuRepo,
        orderGoodsRepo,
      },
    );
    // ??????????????????
    await orderEntityService.updateById(
      {
        orderStatus: MerchantMenuOrderStatusEnum.CANCEL,
      },
      order.id,
      order.merchantUserId,
    );
    return true;
  }

  /**
   * ???????????????????????????????????????
   * @param params
   */
  async sendCancelMenuOrderMessage(params: {
    orderId: number;
    orderNo: string;
    userId: number;
    amount: number;
    merchantId: number;
    refundType: MerchantMenuOrderPayTypeEnum;
  }) {
    const { userId, merchantId, refundType, amount, orderNo, orderId } = params;
    const userinfo = await this.userEntityService.findById(userId, {
      select: ['nickname'],
    });
    return this.wechatTemplateService.sendCancelMenuOrderApplyNotice(
      {
        orderId,
        orderNo,
        username: userinfo?.nickname,
        amount,
        refundTime: new Date(),
        refundType,
      },
      merchantId,
    );
  }

  @UserLock({
    prefix: CLIENT_ORDER_PAY_LOCK_PREFIX,
    error: ClientMenuOrderPayLockedException,
  })
  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async payment(
    id: number,
    payType: MerchantMenuOrderPayTypeEnum,
    identity: ClientIdentity,
    request: FastifyRequest,
    @TransactionRepository(MerchantGoodsEntity)
    goodsRepo?: Repository<MerchantGoodsEntity>,
    @TransactionRepository(MerchantMenuOrderEntity)
    orderRepo?: Repository<MerchantMenuOrderEntity>,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserPointsLogEntity)
    userPointsLogRepo?: Repository<MerchantUserPointsLogEntity>,
    @TransactionRepository(MerchantUserBalanceLogEntity)
    userBalanceLogRepo?: Repository<MerchantUserBalanceLogEntity>,
  ): Promise<ClientMenuOrderSubmitRespDTO> {
    const { userId, merchantId } = identity;
    const order = await this.orderEntityService.findOne({
      where: {
        id,
        merchantUserId: userId,
      },
    });
    switch (payType) {
      case MerchantMenuOrderPayTypeEnum.BALANCE:
        await this.goodsBalancePay(userId, merchantId, order, {
          goodsRepo,
          orderRepo,
          userBalanceLogRepo,
          userPointsLogRepo,
          userRepo,
        });
        return {
          order,
          paySignData: null,
        };
      case MerchantMenuOrderPayTypeEnum.WECHAT:
        const paySignData = await this.genGoodsWechatPayOrder(
          order,
          request.ip,
          identity,
        );
        return {
          order,
          paySignData,
        };
      default:
        throw new ClientMenuOrderPaymentException({
          msg: '??????????????????????????????',
        });
    }
  }

  /**
   * ??????????????????
   * @param userId
   * @param order
   * @param userRepo
   * @param userBalanceLogRepo
   * @param userPointsLogRepo
   * @param orderRepo
   * @param goodsRepo
   */
  async goodsBalancePay(
    userId: number,
    merchantId: number,
    order: MerchantMenuOrderEntity,
    repositorys: {
      userRepo: Repository<MerchantUserEntity>;
      userBalanceLogRepo: Repository<MerchantUserBalanceLogEntity>;
      userPointsLogRepo: Repository<MerchantUserPointsLogEntity>;
      orderRepo: Repository<MerchantMenuOrderEntity>;
      goodsRepo: Repository<MerchantGoodsEntity>;
    },
  ) {
    if (!order?.id) {
      throw new ClientMenuOrderSubmitException({ msg: '???????????????' });
    }
    if (!order.orderGoodsList) {
      order.orderGoodsList = await this.orderGoodsEntityService.find({
        where: { orderId: order.id },
      });
    }
    if (
      order.payStatus === MerchantMenuOrderPayStatusEnum.PAID ||
      order.orderStatus !== MerchantMenuOrderStatusEnum.IN_PROCESS
    ) {
      throw new ClientMenuOrderSubmitException({ msg: '?????????????????????' });
    }
    const { userRepo, userBalanceLogRepo, orderRepo, goodsRepo } = repositorys;
    const orderEntityService = this.getService(orderRepo);
    const goodsSalesList: Array<{ id: number; total: number }> = [];
    order.orderGoodsList.forEach(goods => {
      const item = goodsSalesList.find(val => val.id === goods.goodsId);
      if (item) {
        item.total = MathHelperProvider.add(item.total, goods.totalNum);
      } else {
        goodsSalesList.push({ id: goods.goodsId, total: goods.totalNum });
      }
    });
    order.payType = MerchantMenuOrderPayTypeEnum.BALANCE;
    const modifyOrderData: DeepPartial<MerchantMenuOrderEntity> = {
      payType: MerchantMenuOrderPayTypeEnum.BALANCE,
      payStatus: MerchantMenuOrderPayStatusEnum.PAID,
      payTime: new Date(),
    };
    // ????????????????????????????????????
    if (
      order.deliveryStatus === MerchantMenuOrderDeliveryStatusEnum.DELIVERED
    ) {
      modifyOrderData.receiptStatus =
        MerchantMenuOrderReceiptStatusEnum.RECEIPTED;
      modifyOrderData.receiptTime = new Date();
      modifyOrderData.orderStatus = MerchantMenuOrderStatusEnum.SUCCESS;
    } else {
      // ???????????????????????????????????????????????????????????????????????????
      await this.merchantMenuOrderService.delayAutoCompleteOrder({
        orderId: order.id,
        userId,
        merchantId,
      });
    }
    // ??????????????????
    await orderEntityService.updateById(modifyOrderData, order.id, userId);
    if (order.payPrice > 0) {
      // ??????????????????
      await this.merchantUserService.modifyUserBalance(
        userId,
        merchantId,
        order.payPrice,
        MerchantUserBalanceModifyTypeEnum.SUBTRACT,
        MerchantUserBalanceLogSceneEnum.USER_CONSUME,
        MerchantMenuOrderPayTypeEnum.BALANCE,
        `?????????????????????${order.orderNo}`,
        null,
        {
          userRepo,
          userBalanceLogRepo,
        },
      );
    }
    // ??????????????????
    await Promise.all(
      goodsSalesList.map(item =>
        goodsRepo.increment(
          {
            id: item.id,
          },
          'salesActual',
          item.total,
        ),
      ),
    );
    if (order.payStatus === MerchantMenuOrderPayStatusEnum.OFFLINE_PAY) {
      // ?????????????????????????????????????????????
      await this.sendMenuPayNotify({
        merchantId,
        order,
        orderGoodsList: order.orderGoodsList,
      }).catch(err => this.logger.error(err));
    } else {
      // ???????????????????????????????????????
      await this.merchantMenuOrderService
        .sendSubmitMenuNotify({
          merchantId,
          order,
          orderGoodsList: order.orderGoodsList,
        })
        .catch(err => this.logger.error(err));
      // ??????????????????
      await this.merchantMenuOrderService.printOrder(
        order.id,
        merchantId,
        order,
      );
    }
    return orderEntityService.repository.merge(order, modifyOrderData);
  }

  /**
   * ????????????????????????????????????
   * @param orderId
   * @param orderNo
   * @param payPrice
   * @param payClientIp
   * @param param4
   */
  async genGoodsWechatPayOrder(
    order: MerchantMenuOrderEntity,
    payClientIp: string,
    { userId, openid, merchantId }: ClientIdentity,
  ) {
    if (!order?.id) {
      throw new ClientMenuOrderSubmitException({ msg: '???????????????' });
    }
    return this.rechargeService.genWechatPayOrder(
      '????????????',
      order.payPrice,
      {
        userId,
        merchantId,
        scene: WechatPaymentOrderSceneEnum.BUY_GOODS,
        orderId: order.id,
      },
      payClientIp,
      openid,
      merchantId,
      order.orderNo,
    );
  }
}
