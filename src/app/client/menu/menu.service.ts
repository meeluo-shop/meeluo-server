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
   * 获取用户订单列表
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
   * 获取订单详情
   */
  async detail(id: number, merchantId: number, userId?: number) {
    return this.merchantMenuOrderService.detail(id, merchantId, userId);
  }

  /**
   * 提交订单
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
      // 检验优惠券是否可用
      coupon = await this.merchantCouponService.checkCoupon(
        couponId,
        userId,
        merchantId,
      );
    }
    // 检查库存
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
    // 计算会员折扣
    await this.merchantMenuOrderService.setOrderGoodsGradeMoney(
      goodsList,
      userinfo,
    );
    // 计算商品会员折扣后的总金额
    for (const goods of goodsList) {
      goods.totalPrice = MathHelperProvider.multiply(
        goods.gradeGoodsPrice || goods.skus[0].price,
        goods.goodsNum,
      );
    }
    if (coupon) {
      // 计算优惠券折扣
      couponMoney = this.setCouponFee(coupon, goodsList);
      // 将优惠券设置为已使用状态
      await couponGrantEntityService.updateById(
        {
          isUsed: MerchantCouponIsUsedEnum.TRUE,
        },
        coupon.id,
        userId,
      );
    }
    const [pointsSetting, orderSetting] = await Promise.all([
      // 获取用户积分数量和积分设置
      this.pointsSettingService.getPointsSetting(merchantId),
      // 获取点餐订单流程配置
      this.merchantMenuSettingService.getOrderSetting(merchantId),
    ]);
    let orderPointsDiscountNum = 0;
    let orderPointsDiscountAmount = 0;
    if (usePointsDiscount) {
      const data = this.setOrderPoints(pointsSetting, goodsList, userinfo);
      orderPointsDiscountNum = data.orderPointsDiscountNum;
      orderPointsDiscountAmount = data.orderPointsDiscountAmount;
    }
    // 计算订单商品的实际付款金额
    const {
      orderGoodsPrice,
      goodsTotalPrice,
    } = this.merchantMenuOrderService.setOrderGoodsPayPrice(goodsList);
    // 计算积分赠送数量
    const pointsBonus = this.getOrderPointsBonus(pointsSetting, goodsList);
    // 计算餐具/调料费
    const wareFee = MathHelperProvider.multiply(tableInfo.wareFee, people);
    const orderPayPrice = MathHelperProvider.add(orderGoodsPrice, wareFee) || 0;
    // 判断余额支付
    if (payType === MerchantMenuPayTypeEnum.BALANCE) {
      if (userinfo.balance < orderPayPrice) {
        throw new ClientMenuOrderSubmitException({
          msg: '您的余额不足，无法使用余额支付',
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
    // 创建订单记录
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

    // 保存订单商品信息
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
    // 下单减库存
    await Promise.all(
      goodsList.map(goods =>
        goodsSkuRepo.decrement(
          { id: goods.skus[0].id },
          'stock',
          goods.goodsNum,
        ),
      ),
    );
    // 积分抵扣情况下扣除用户积分
    if (usePointsDiscount && orderPointsDiscountNum > 0) {
      await this.merchantUserService.modifyUserPoints(
        userId,
        merchantId,
        orderPointsDiscountNum,
        MerchantUserPointsModifyTypeEnum.SUBTRACT,
        `用户购买商品：${order.orderNo}`,
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
      // 余额支付
      paidOrder = await this.goodsBalancePay(userId, merchantId, order, {
        userRepo,
        userPointsLogRepo,
        userBalanceLogRepo,
        orderRepo,
        goodsRepo,
      });
    } else if (payType === MerchantMenuPayTypeEnum.WECHAT) {
      // 生成微信支付签名信息
      paySignData = await this.genGoodsWechatPayOrder(
        order,
        request.ip,
        identity,
      );
      if (orderSetting.notPayAutoCancelMin > 0) {
        // 给未付款订单增加定时任务，超过配置时间，自动取消
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
      // 给餐后付款的订单增加定时任务，超过配置时间，自动完成
      await this.merchantMenuOrderService.delayAutoCompleteOrder({
        orderId: order.id,
        userId,
        merchantId,
        orderSetting,
      });
      // 给商户员工发送消息通知
      await this.merchantMenuOrderService
        .sendSubmitMenuNotify({
          merchantId,
          order,
          orderGoodsList: order.orderGoodsList,
        })
        .catch(err => this.logger.error(err));
      // 打印订单小票
      await this.merchantMenuOrderService.printOrder(
        order.id,
        merchantId,
        order,
      );
    }
    // 清除订单商品缓存
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
   * 计算优惠券折扣
   * @param coupon
   * @param goodsList
   * @returns
   */
  setCouponFee(
    coupon: MerchantCouponGrantEntity,
    goodsList: MerchantMenuOrderGoodsInfo[],
  ) {
    // 优惠券抵扣的金额
    let orderCouponDiscountAmount = 0;
    let orderTotalPrice = 0;
    let discountTemp = 0;
    let weightTemp = 0;

    // 计算所有商品会员折扣后的总订单价格
    for (const goods of goodsList) {
      orderTotalPrice = MathHelperProvider.add(
        orderTotalPrice,
        goods.totalPrice,
      );
    }
    // 判断订单总额为0
    if (orderTotalPrice <= 0) {
      return 0;
    }
    // 判断订单总额低于优惠券最低消费金额
    if (orderTotalPrice < coupon.minPrice) {
      throw new ClientMenuOrderSubmitException({ msg: '优惠券不满足使用条件' });
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
    // 判断优惠券优惠金额为0
    if (orderCouponDiscountAmount <= 0) {
      return 0;
    }
    for (const index in goodsList) {
      const goods = goodsList[index];
      // 判断是最后一个元素
      if (Number(index) === goodsList.length - 1) {
        goods.weight = MathHelperProvider.subtract(1, weightTemp);
        goods.couponMoney = MathHelperProvider.subtract(
          orderCouponDiscountAmount,
          discountTemp,
        );
        continue;
      }
      // 计算权重占比，保留两位小数
      goods.weight =
        Math.round((goods.totalPrice / orderTotalPrice) * 100) / 100;
      // 计算优惠券抵扣商品金额，保留两位小数
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
   * 计算订单可用积分抵扣
   * @return bool
   */
  setOrderPoints(
    pointsSetting: MerchantPointsSettingDTO,
    goodsList: MerchantMenuOrderGoodsInfo[],
    userinfo: MerchantUserEntity,
  ) {
    // 订单最终用积分抵扣的金额
    let orderPointsDiscountAmount = 0;
    // 订单最终用积分抵扣的数量
    let orderPointsDiscountNum = 0;
    // 用户最多可用积分抵扣的金额
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
        // 判断积分数量是小数
        if (
          parseInt(String(goods.pointsNum)) <
          parseFloat(String(goods.pointsNum))
        ) {
          // 将积分重置为整数
          goods.pointsNum = Math.floor(goods.pointsNum);
          // 将积分抵扣金额重置为整数积分对应的金额
          goods.pointsMoney = MathHelperProvider.multiply(
            goods.pointsNum,
            pointsSetting.discountRatio,
          );
          // 重置剩余的积分抵扣金额
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
   * 获取赠送的积分数量
   * @param pointsSetting
   * @param goodsList
   */
  getOrderPointsBonus(
    pointsSetting: MerchantPointsSettingDTO,
    goodsList: MerchantMenuOrderGoodsInfo[],
  ) {
    // 订单赠送的积分数量
    let giftPointsNum = 0;
    // 商品总价 - 优惠抵扣
    for (const goods of goodsList) {
      if (goods.isPointsGift === MerchantGoodsIsPointsGiftEnum.FALSE) {
        continue;
      }
      // 计算赠送的积分数量，按照商品原始金额（不包含折扣和优惠）计算
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
   * 取消订单
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
      throw new ClientMenuOrderCancelException({ msg: '无效的订单' });
    }
    if (order.orderStatus !== MerchantMenuOrderStatusEnum.IN_PROCESS) {
      throw new ClientMenuOrderCancelException({ msg: '错误的订单状态' });
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
      consumeDesc: `用户购买商品`,
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
        msg: '错误的订单状态',
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
    // 判断如果已经全部上餐完毕
    if (
      order.deliveryStatus === MerchantMenuOrderDeliveryStatusEnum.DELIVERED
    ) {
      modifyOrderData.receiptStatus =
        MerchantMenuOrderReceiptStatusEnum.RECEIPTED;
      modifyOrderData.receiptTime = new Date();
      modifyOrderData.orderStatus = MerchantMenuOrderStatusEnum.SUCCESS;
    } else {
      // 给已付款的订单增加定时任务，超过配置时间，自动完成
      await this.merchantMenuOrderService.delayAutoCompleteOrder({
        orderId: order.id,
        userId,
        merchantId,
      });
    }
    // 修改订单信息
    await orderEntityService.updateById(modifyOrderData, order.id, userId);
    // 增加商品销量
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
      // 给商户员工发送餐后付款成功通知
      await this.sendMenuPayNotify({
        merchantId,
        order,
        orderGoodsList: order.orderGoodsList,
      }).catch(err => this.logger.error(err));
    } else {
      // 给商户员工发送下单消息通知
      await this.merchantMenuOrderService
        .sendSubmitMenuNotify({
          merchantId,
          order,
          orderGoodsList: order.orderGoodsList,
        })
        .catch(err => this.logger.error(err));
      // 打印订单小票
      await this.merchantMenuOrderService.printOrder(
        order.id,
        merchantId,
        order,
      );
    }
    return true;
  }

  /**
   * 发送订单支付通知给员工
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
      goodsNames.push(`${goods.name}（${goods.specs}）✕ ${goods.totalNum}`);
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
        menus: goodsNames.join('；'),
        surplusOrderNum: surplusOrderNum,
      },
      merchantId,
    );
  }

  /**
   * 取消已付款未上餐订单
   */
  async cancelPaidOrder(order: MerchantMenuOrderEntity) {
    if (!order.id) {
      return false;
    }
    // 更新订单状态
    await this.orderEntityService.updateById(
      {
        orderStatus: MerchantMenuOrderStatusEnum.WAIT_CANCEL,
      },
      order.id,
      order.merchantUserId,
    );
    // 发送退款申请通知给商户员工
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
   * 取消未付款订单
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
    // 回退商品库存
    await this.merchantMenuOrderService.goodsStockRollBack(
      order.id,
      order.merchantUserId,
      order.merchantId,
      {
        goodsSkuRepo,
        orderGoodsRepo,
      },
    );
    // 更新订单状态
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
   * 发送退款申请通知给商户员工
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
          msg: '请选择正确的支付方式',
        });
    }
  }

  /**
   * 余额支付方法
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
      throw new ClientMenuOrderSubmitException({ msg: '无效的订单' });
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
      throw new ClientMenuOrderSubmitException({ msg: '错误的订单状态' });
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
    // 判断如果已经全部上餐完毕
    if (
      order.deliveryStatus === MerchantMenuOrderDeliveryStatusEnum.DELIVERED
    ) {
      modifyOrderData.receiptStatus =
        MerchantMenuOrderReceiptStatusEnum.RECEIPTED;
      modifyOrderData.receiptTime = new Date();
      modifyOrderData.orderStatus = MerchantMenuOrderStatusEnum.SUCCESS;
    } else {
      // 给已付款的订单增加定时任务，超过配置时间，自动完成
      await this.merchantMenuOrderService.delayAutoCompleteOrder({
        orderId: order.id,
        userId,
        merchantId,
      });
    }
    // 修改订单信息
    await orderEntityService.updateById(modifyOrderData, order.id, userId);
    if (order.payPrice > 0) {
      // 扣除用户余额
      await this.merchantUserService.modifyUserBalance(
        userId,
        merchantId,
        order.payPrice,
        MerchantUserBalanceModifyTypeEnum.SUBTRACT,
        MerchantUserBalanceLogSceneEnum.USER_CONSUME,
        MerchantMenuOrderPayTypeEnum.BALANCE,
        `用户购买商品：${order.orderNo}`,
        null,
        {
          userRepo,
          userBalanceLogRepo,
        },
      );
    }
    // 增加商品销量
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
      // 给商户员工发送餐后付款成功通知
      await this.sendMenuPayNotify({
        merchantId,
        order,
        orderGoodsList: order.orderGoodsList,
      }).catch(err => this.logger.error(err));
    } else {
      // 给商户员工发送下单消息通知
      await this.merchantMenuOrderService
        .sendSubmitMenuNotify({
          merchantId,
          order,
          orderGoodsList: order.orderGoodsList,
        })
        .catch(err => this.logger.error(err));
      // 打印订单小票
      await this.merchantMenuOrderService.printOrder(
        order.id,
        merchantId,
        order,
      );
    }
    return orderEntityService.repository.merge(order, modifyOrderData);
  }

  /**
   * 生成微信支付购买商品订单
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
      throw new ClientMenuOrderSubmitException({ msg: '无效的订单' });
    }
    return this.rechargeService.genWechatPayOrder(
      '购买商品',
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
