import * as lodash from 'lodash';
import * as QS from 'querystring';
import { FastifyRequest } from 'fastify';
import { BaseService } from '@app/app.service';
import { DeepPartial } from 'typeorm';
import {
  In,
  InjectService,
  Repository,
  Transaction,
  TransactionRepository,
} from '@jiaxinjiang/nest-orm';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';
import { Inject, Injectable } from '@nestjs/common';
import {
  MerchantEntity,
  MerchantUserEntity,
  MerchantDeliveryEntity,
  MerchantGoodsEntity,
  MerchantGoodsSkuEntity,
  MerchantUserAddressEntity,
  MerchantOrderPayTypeEnum,
  MerchantOrderEntity,
  MerchantOrderDeliveryTypeEnum,
  MerchantOrderAddressEntity,
  MerchantOrderExtractEntity,
  MerchantOrderGoodsEntity,
  MerchantUserPointsModifyTypeEnum,
  MerchantUserBalanceLogEntity,
  MerchantOrderPayStatusEnum,
  MerchantOrderStatusEnum,
  MerchantUserPointsLogEntity,
  MerchantUserBalanceModifyTypeEnum,
  MerchantUserBalanceLogSceneEnum,
  WechatPaymentOrderSceneEnum,
  MerchantOrderDeliveryStatusEnum,
  MerchantOrderReceiptStatusEnum,
  WechatPaymentOrderTradeStateEnum,
  MerchantGoodsIsPointsGiftEnum,
  MerchantCouponGrantEntity,
  MerchantCouponTypeEnum,
  MerchantCouponIsUsedEnum,
  MerchantCouponEntity,
} from '@typeorm/meeluoShop';
import { MerchantWechatTemplateService } from '@app/merchant/wechat/template';
import { MerchantDeliveryService } from '@app/merchant/delivery';
import { OrmService } from '@typeorm/orm.service';
import { ClientCartService } from '../cart';
import { UserLock } from '@core/decorator';
import {
  ClientRechargeService,
  ClientRechargeWechatPayFailedException,
} from '../recharge';
import {
  ClientOrderDeliveryFeeDTO,
  ClientOrderGoodsSkusDTO,
  ClientOrderListDTO,
  ClientOrderPaySignData,
  ClientOrderPickUpGoodsDTO,
  ClientOrderSubmitDTO,
  ClientOrderSubmitRespDTO,
} from './order.dto';
import {
  ClientOrderSubmitException,
  ClientOrderIsNotIntraRegionException,
  ClientOrderLackOfStockException,
  ClientOrderPayLockedException,
  ClientOrderPaymentException,
  ClientOrderCancelException,
  ClientOrderReceiptException,
  ClientOrderInvaildPaymentOrderIdException,
} from './order.exception';
import { ClientOrderGoodsInfo } from './order.interface';
import {
  MerchantGoodsSpecService,
  MerchantGoodsService,
} from '@app/merchant/goods';
import { CLIENT_ORDER_PAY_LOCK_PREFIX } from '@core/constant';
import { MerchantUserService } from '@app/merchant/user';
import { MerchantUserGradeService } from '@app/merchant/user/grade';
import { ClientPointsSettingService } from '../points/setting';
import { UtilHelperProvider, MathHelperProvider } from '@shared/helper';
import { ResourceService } from '@app/common/resource';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { MerchantPointsSettingDTO } from '@app/merchant/points';
import { MerchantOrderService } from '@app/merchant/order';
import { MerchantOrderSettingService } from '@app/merchant/order/setting';
import { OrderMessageTypeEnum } from '@app/consumer/order/order.dto';
import { MerchantCouponService } from '@app/merchant/coupon';

@Injectable()
export class ClientOrderService extends BaseService {
  constructor(
    @InjectLogger(ClientOrderService)
    private logger: LoggerProvider,
    @Inject(ResourceService)
    private resourceService: ResourceService,
    @Inject(MerchantUserService)
    private merchantUserService: MerchantUserService,
    @Inject(MerchantOrderService)
    private merchantOrderService: MerchantOrderService,
    @Inject(MerchantCouponService)
    private merchantCouponService: MerchantCouponService,
    @Inject(ClientRechargeService)
    private rechargeService: ClientRechargeService,
    @Inject(ClientCartService)
    private cartService: ClientCartService,
    @Inject(MerchantWechatTemplateService)
    private wechatTemplateService: MerchantWechatTemplateService,
    @Inject(ClientPointsSettingService)
    private pointsSettingService: ClientPointsSettingService,
    @Inject(MerchantDeliveryService)
    private deliveryService: MerchantDeliveryService,
    @Inject(MerchantUserGradeService)
    private merchantGradeService: MerchantUserGradeService,
    @Inject(MerchantGoodsService)
    private merchantGoodsService: MerchantGoodsService,
    @Inject(MerchantGoodsSpecService)
    private merchantGoodsSpecService: MerchantGoodsSpecService,
    @Inject(MerchantOrderSettingService)
    private merchantOrderSettingService: MerchantOrderSettingService,
    @InjectService(MerchantEntity)
    private merchantEntityService: OrmService<MerchantEntity>,
    @InjectService(MerchantUserEntity)
    private userEntityService: OrmService<MerchantUserEntity>,
    @InjectService(MerchantOrderEntity)
    private orderEntityService: OrmService<MerchantOrderEntity>,
    @InjectService(MerchantOrderGoodsEntity)
    private orderGoodsEntityService: OrmService<MerchantOrderGoodsEntity>,
    @InjectService(MerchantUserAddressEntity)
    private addressEntityService: OrmService<MerchantUserAddressEntity>,
    @InjectService(MerchantGoodsEntity)
    private goodsEntityService: OrmService<MerchantGoodsEntity>,
    @InjectService(MerchantGoodsSkuEntity)
    private goodsSkuEntityService: OrmService<MerchantGoodsSkuEntity>,
    @InjectService(MerchantDeliveryEntity)
    private deliveryEntityService: OrmService<MerchantDeliveryEntity>,
  ) {
    super();
  }

  /**
   * 获取用户订单列表
   */
  async list(
    { pageSize, pageIndex, status }: ClientOrderListDTO,
    { userId, merchantId }: ClientIdentity,
  ) {
    return this.merchantOrderService.list(
      { pageSize, pageIndex, status, userId },
      merchantId,
    );
  }

  /**
   * 获取订单详情
   */
  async detail(id: number, merchantId: number, userId?: number) {
    return this.merchantOrderService.detail(id, merchantId, userId);
  }

  /**
   * 自提订单，员工发放订单商品
   * @param data
   * @param param1
   */
  async pickUpGoods(
    data: ClientOrderPickUpGoodsDTO,
    { staffId, merchantId }: ClientIdentity,
  ) {
    return this.merchantOrderService.pickUpGoods(
      {
        ...data,
        staffId,
      },
      staffId,
      merchantId,
    );
  }

  /**
   * 提交商品订单
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
    error: ClientOrderPayLockedException,
  })
  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async submit(
    {
      goodsSkus,
      usePointsDiscount,
      addressId,
      deliveryType,
      linkman,
      phone,
      payType,
      remark,
      couponId,
    }: ClientOrderSubmitDTO,
    identity: ClientIdentity,
    request: FastifyRequest,
    @TransactionRepository(MerchantGoodsEntity)
    goodsRepo?: Repository<MerchantGoodsEntity>,
    @TransactionRepository(MerchantGoodsSkuEntity)
    goodsSkuRepo?: Repository<MerchantGoodsSkuEntity>,
    @TransactionRepository(MerchantOrderEntity)
    orderRepo?: Repository<MerchantOrderEntity>,
    @TransactionRepository(MerchantOrderGoodsEntity)
    orderGoodsRepo?: Repository<MerchantOrderGoodsEntity>,
    @TransactionRepository(MerchantOrderAddressEntity)
    orderAddressRepo?: Repository<MerchantOrderAddressEntity>,
    @TransactionRepository(MerchantOrderExtractEntity)
    orderExtractRepo?: Repository<MerchantOrderExtractEntity>,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserPointsLogEntity)
    userPointsLogRepo?: Repository<MerchantUserPointsLogEntity>,
    @TransactionRepository(MerchantUserBalanceLogEntity)
    userBalanceLogRepo?: Repository<MerchantUserBalanceLogEntity>,
    @TransactionRepository(MerchantCouponGrantEntity)
    couponGrantRepo?: Repository<MerchantCouponGrantEntity>,
  ): Promise<ClientOrderSubmitRespDTO> {
    let couponMoney = 0;
    let coupon: MerchantCouponGrantEntity;
    let orderDeliveryPrice = 0;
    let addressInfo: MerchantOrderAddressEntity;
    const { merchantId, userId } = identity;
    const userEntityService = this.getService(userRepo);
    const orderEntityService = this.getService(orderRepo);
    const orderGoodsEntityService = this.getService(orderGoodsRepo);
    const orderAddressEntityService = this.getService(orderAddressRepo);
    const orderExtractEntityService = this.getService(orderExtractRepo);
    const couponGrantEntityService = this.getService(couponGrantRepo);
    const goodsList = await this.getOrderGoodsData(goodsSkus, merchantId);
    if (couponId) {
      // 检验优惠券是否可用
      coupon = await this.merchantCouponService.checkCoupon(
        couponId,
        userId,
        merchantId,
      );
    }
    // 判断收货方式是否是邮寄
    if (deliveryType === MerchantOrderDeliveryTypeEnum.DISTRIBUTION) {
      addressInfo = await this.addressEntityService.findOne({
        where: {
          id: addressId,
          merchantUserId: userId,
          merchantId,
        },
      });
      if (!addressInfo) {
        throw new ClientOrderSubmitException({
          msg: '错误的收货地址，请重新选择',
        });
      }
      delete addressInfo.id;
      const deliveryList = await this.getOrderDeliveryData(
        String(addressInfo.cityCode),
        goodsList,
      );
      // 计算运费
      orderDeliveryPrice = await this.deliveryService.calcDeliveryAmount(
        String(addressInfo.cityCode),
        goodsList,
        deliveryList,
        merchantId,
      );
    } else {
      if (!linkman || !phone) {
        throw new ClientOrderSubmitException({
          msg: '您还没有填写联系人和电话',
        });
      }
    }
    // 检查库存
    this.validateGoodsStockNum(goodsList);
    // 获取订单商品总金额(不含优惠折扣)
    const userinfo = await userEntityService.findOne({
      select: ['point', 'balance', 'gradeId', 'merchantId'],
      where: {
        id: userId,
        merchantId,
      },
    });
    // 计算会员折扣
    await this.setOrderGoodsGradeMoney(goodsList, userinfo);
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
    // 获取用户积分数量和积分设置
    const pointsSetting = await this.pointsSettingService.getPointsSetting(
      merchantId,
    );
    let orderPointsDiscountNum = 0;
    let orderPointsDiscountAmount = 0;
    if (usePointsDiscount) {
      const data = this.setOrderPoints(pointsSetting, goodsList, userinfo);
      orderPointsDiscountNum = data.orderPointsDiscountNum;
      orderPointsDiscountAmount = data.orderPointsDiscountAmount;
    }
    // 计算订单商品的实际付款金额
    const { orderGoodsPrice, goodsTotalPrice } = this.setOrderGoodsPayPrice(
      goodsList,
    );
    // 计算积分赠送数量
    const pointsBonus = this.getOrderPointsBonus(pointsSetting, goodsList);
    const orderPayPrice =
      MathHelperProvider.add(orderGoodsPrice, orderDeliveryPrice) || 0;
    // 判断余额支付
    if (payType === MerchantOrderPayTypeEnum.BALANCE) {
      if (userinfo.balance < orderPayPrice) {
        throw new ClientOrderSubmitException({
          msg: '您的余额不足，无法使用余额支付',
        });
      }
    }
    // 创建订单记录
    const order = await orderEntityService.create(
      {
        orderNo: UtilHelperProvider.generateOrderNo(),
        totalPrice: goodsTotalPrice,
        orderPrice: orderGoodsPrice,
        pointsMoney: orderPointsDiscountAmount,
        pointsNum: orderPointsDiscountNum,
        payPrice: orderPayPrice,
        buyerRemark: remark,
        couponMoney,
        couponId: coupon?.id || null,
        payType,
        deliveryType,
        pointsBonus,
        expressPrice: orderDeliveryPrice,
        merchantId,
        merchantUserId: userId,
      },
      userId,
    );
    // 判断收货方式是否是邮寄
    if (deliveryType === MerchantOrderDeliveryTypeEnum.DISTRIBUTION) {
      // 创建订单收货地址记录
      await orderAddressEntityService.create(
        {
          ...addressInfo,
          orderId: order.id,
        },
        userId,
      );
    } else {
      // 创建订单自提信息记录
      await orderExtractEntityService.create(
        {
          linkman,
          phone,
          merchantId,
          orderId: order.id,
          merchantUserId: userId,
        },
        userId,
      );
    }
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
    let paidOrder: MerchantOrderEntity = null;
    let paySignData: ClientOrderPaySignData = null;
    if (payType === MerchantOrderPayTypeEnum.BALANCE || order.payPrice <= 0) {
      // 余额支付
      paidOrder = await this.goodsBalancePay(userId, merchantId, order, {
        userRepo,
        userPointsLogRepo,
        userBalanceLogRepo,
        orderRepo,
        goodsRepo,
      });
    } else {
      // 微信支付
      paySignData = await this.genGoodsWechatPayOrder(
        order,
        request.ip,
        identity,
      );
      const orderSetting = await this.merchantOrderSettingService.getOrderSetting(
        merchantId,
      );
      if (orderSetting.notPayAutoCancelDay > 0) {
        // 给未付款订单增加定时任务，超过配置时间，自动取消
        await this.merchantOrderService.pushOrderDelayTask(
          OrderMessageTypeEnum.AUTO_CANCEL_NOT_PAY_ORDER,
          {
            orderId: order.id,
            merchantId,
            userId,
          },
          orderSetting.notPayAutoCancelDay * 24 * 3600 * 1000,
        );
      }
    }
    // 清除订单商品缓存
    await Promise.all(
      Array.from(new Set(goodsList.map(val => val.id))).map(id =>
        this.merchantGoodsService.clearDetailCache(id, merchantId),
      ),
    );
    // 删除购物车里的商品
    await Promise.all(
      order.orderGoodsList.map(goods =>
        this.cartService.delete(
          {
            goodsId: goods.goodsId,
            specSkuId: goods.specSkuId,
          },
          identity,
          false,
        ),
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
    goodsList: ClientOrderGoodsInfo[],
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
      throw new ClientOrderSubmitException({ msg: '优惠券不满足使用条件' });
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
   * 计算订单商品的实际付款金额
   */
  setOrderGoodsPayPrice(goodsList: ClientOrderGoodsInfo[]) {
    let orderGoodsPrice = 0;
    let goodsTotalPrice = 0;
    // 商品总价 - 优惠抵扣
    for (const goods of goodsList) {
      // 会员价格减去积分抵扣金额
      goods.totalPayPrice = MathHelperProvider.subtract(
        goods.totalPrice,
        MathHelperProvider.add(goods.couponMoney, goods.pointsMoney),
      );
      goodsTotalPrice = MathHelperProvider.add(
        goodsTotalPrice,
        goods.totalPrice,
      );
      orderGoodsPrice = MathHelperProvider.add(
        orderGoodsPrice,
        goods.totalPayPrice,
      );
    }
    return {
      goodsTotalPrice,
      orderGoodsPrice,
    };
  }

  /**
   * 计算订单可用积分抵扣
   * @return bool
   */
  setOrderPoints(
    pointsSetting: MerchantPointsSettingDTO,
    goodsList: ClientOrderGoodsInfo[],
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
    goodsList: ClientOrderGoodsInfo[],
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
   * 计算商品会员折扣价
   * @param goodsList
   * @param userId
   * @param merchantId
   */
  async setOrderGoodsGradeMoney(
    goodsList: ClientOrderGoodsInfo[],
    userinfo: MerchantUserEntity,
  ) {
    // 获取用户会员信息
    await this.merchantGradeService.bindUsersGrade(
      userinfo,
      userinfo.merchantId,
    );
    if (!userinfo.grade) {
      return false;
    }
    for (const goods of goodsList) {
      if (
        !goods.isEnableGrade ||
        userinfo.grade.equity <= 0 ||
        userinfo.grade.equity > 100
      ) {
        continue;
      }
      goods.gradeRatio = MathHelperProvider.divide(userinfo.grade.equity, 100);
      goods.gradeGoodsPrice =
        MathHelperProvider.divide(
          MathHelperProvider.multiply(
            goods.skus[0].price,
            userinfo.grade.equity,
          ),
          100,
        ) || 0.01;
      goods.gradeTotalMoney = MathHelperProvider.multiply(
        goods.gradeGoodsPrice,
        goods.goodsNum,
      );
    }
    return true;
  }

  /**
   * 检验商品库存情况
   * @param goodsList
   */
  validateGoodsStockNum(goodsList: ClientOrderGoodsInfo[]) {
    for (const goods of goodsList) {
      if (goods.goodsNum > goods.skus[0].stock) {
        throw new ClientOrderLackOfStockException({
          msg: `很抱歉，商品 “${goods.name}” 库存不足`,
        });
      }
    }
  }

  /**
   * 获取订单商品规格属性
   * @param goodsSkus
   * @param merchantId
   */
  async getOrderGoodsData(
    goodsSkus: ClientOrderGoodsSkusDTO[],
    merchantId: number,
  ) {
    const goodsIds = Array.from(new Set(goodsSkus.map(val => val.goodsId)));
    const skuIds = Array.from(
      new Set(goodsSkus.map(val => val.specSkuId || '')),
    );
    const [goodsList, skusList] = await Promise.all([
      // 获取商品列表
      this.goodsEntityService.find({
        where: {
          id: In(goodsIds.length ? goodsIds : [null]),
          merchantId,
        },
      }),
      // 获取商品规格列表
      this.goodsSkuEntityService.find({
        where: {
          goodsId: In(goodsIds.length ? goodsIds : [null]),
          specSkuId: In(skuIds.length ? skuIds : [null]),
        },
      }),
    ]);
    await Promise.all([
      // 获取商品规格参数信息
      this.merchantGoodsSpecService.bindGoodsSpecList(goodsList),
      // 获取商品缩略图地址
      this.resourceService.bindTargetResource(
        goodsList,
        'thumbnail',
        'thumbnailId',
      ),
    ]);
    // 组装商品和商品规格
    const goodsRecords: Array<ClientOrderGoodsInfo> = [];
    for (const goodsSku of goodsSkus) {
      const goods = goodsList.find(
        val => val.id === goodsSku.goodsId,
      ) as ClientOrderGoodsInfo;
      if (!goods) {
        continue;
      }
      const goodsRecord = lodash.cloneDeep(goods);
      goodsRecord.gradeRatio = 0;
      goodsRecord.gradeGoodsPrice = 0;
      goodsRecord.gradeTotalMoney = 0;
      goodsRecord.pointsNum = 0;
      goodsRecord.pointsMoney = 0;
      goodsRecord.goodsNum = goodsSku.goodsNum;
      goodsRecord.totalPrice = 0;
      goodsRecord.totalPayPrice = 0;
      goodsRecord.pointsBonus = 0;
      goodsRecord.specs = '';
      goodsRecord.weight = 0;
      goodsRecord.couponMoney = 0;
      goodsRecord.specMappings.forEach(mapping => {
        if (
          goodsSku.specSkuId.split('_').includes(String(mapping.specValueId))
        ) {
          goodsRecord.specs += `${mapping.spec.name}：${mapping.specValue.value}；`;
        }
      });
      const sku = skusList.find(
        val =>
          val.specSkuId === goodsSku.specSkuId &&
          val.goodsId === goodsRecord.id,
      );
      if (!sku) {
        continue;
      }
      // 判断是不是有重复的商品规格
      const targetGoods = goodsRecords.find(
        record => record.skus[0].id === sku.id,
      );
      if (targetGoods) {
        targetGoods.goodsNum += goodsRecord.goodsNum;
        continue;
      }
      if (sku.imageId) {
        await this.resourceService.bindTargetResource(sku, 'image', 'imageId');
      }
      goodsRecord.skus = [sku];
      goodsRecords.push(goodsRecord);
    }
    return goodsRecords;
  }

  /**
   * 获取订单商品配送列表
   * @param cityId
   * @param goodsRecords
   */
  async getOrderDeliveryData(cityId: string, goodsList: MerchantGoodsEntity[]) {
    // 获取商品配送信息列表
    const deliveryIds = goodsList.map(goods => goods.deliveryId);
    const deliveryList = await this.deliveryEntityService.find({
      relations: ['rules'],
      where: { id: In(deliveryIds.length ? deliveryIds : [null]) },
    });
    for (const goods of goodsList) {
      const delivery = deliveryList.find(
        delivery => delivery.id === goods.deliveryId,
      );
      if (!this.deliveryService.isIntraRegion(cityId, delivery)) {
        throw new ClientOrderIsNotIntraRegionException({
          msg: `很抱歉，您的收货地址不在商品 “${goods.name}” 的配送范围内`,
        });
      }
    }
    return deliveryList;
  }

  /**
   * 获取订单所需的配送费用
   * @param param0
   * @param param1
   */
  async deliveryFee(
    { goodsSkus, cityId }: ClientOrderDeliveryFeeDTO,
    { merchantId }: ClientIdentity,
  ) {
    const goodsList = await this.getOrderGoodsData(goodsSkus, merchantId);
    const deliveryList = await this.getOrderDeliveryData(cityId, goodsList);
    // 计算运费
    return this.deliveryService.calcDeliveryAmount(
      cityId,
      goodsList,
      deliveryList,
      merchantId,
    );
  }

  /**
   * 确认收货
   */
  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async receipt(
    id: number,
    userId: number,
    merchantId: number,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserPointsLogEntity)
    userPointsLogRepo?: Repository<MerchantUserPointsLogEntity>,
    @TransactionRepository(MerchantCouponEntity)
    couponRepo?: Repository<MerchantCouponEntity>,
    @TransactionRepository(MerchantCouponGrantEntity)
    couponGrantRepo?: Repository<MerchantCouponGrantEntity>,
  ) {
    const order = await this.orderEntityService.findOne({
      where: {
        id,
        merchantUserId: userId,
      },
    });
    if (!order) {
      throw new ClientOrderReceiptException({ msg: '无效的订单' });
    }
    // 验证订单是否合法
    // 条件1: 订单必须已发货
    // 条件2: 订单必须未收货
    if (
      order.deliveryStatus === MerchantOrderDeliveryStatusEnum.NO_DELIVERED ||
      order.receiptStatus !== MerchantOrderReceiptStatusEnum.NO_RECEIPTED
    ) {
      throw new ClientOrderReceiptException({ msg: '无效的订单状态' });
    }
    await this.orderEntityService.updateById(
      {
        orderStatus: MerchantOrderStatusEnum.SUCCESS,
        receiptStatus: MerchantOrderReceiptStatusEnum.RECEIPTED,
        receiptTime: new Date(),
      },
      id,
      userId,
    );
    // 增加用户积分
    await this.merchantUserService.modifyUserPoints(
      userId,
      merchantId,
      order.pointsBonus,
      MerchantUserPointsModifyTypeEnum.ADD,
      `用户购买积分商品：${order.orderNo}`,
      null,
      {
        userRepo,
        userPointsLogRepo,
      },
      false,
    );
    // 发放优惠券
    await this.merchantOrderService.grantOrderGoodsCoupon(
      couponRepo,
      couponGrantRepo,
      id,
    );
    return true;
  }

  /**
   * 取消商品订单
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
      throw new ClientOrderCancelException({ msg: '无效的订单' });
    }
    if (order.orderStatus !== MerchantOrderStatusEnum.IN_PROCESS) {
      throw new ClientOrderCancelException({ msg: '错误的订单状态' });
    }
    if (order.payStatus === MerchantOrderPayStatusEnum.PAID) {
      await this.cancelPaidOrder(order);
    } else {
      await this.cancelNotPayOrder(order);
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
    @TransactionRepository(MerchantOrderEntity)
    orderRepo?: Repository<MerchantOrderEntity>,
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
      throw new ClientOrderInvaildPaymentOrderIdException();
    }
    if (
      order.payStatus !== MerchantOrderPayStatusEnum.NOT_PAID ||
      order.orderStatus !== MerchantOrderStatusEnum.IN_PROCESS
    ) {
      throw new ClientOrderInvaildPaymentOrderIdException({
        msg: '错误的订单状态',
      });
    }
    order.orderGoodsList = await this.orderGoodsEntityService.find({
      select: ['totalNum', 'goodsId', 'totalPayPrice', 'name'],
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
    const modifyOrderData: DeepPartial<MerchantOrderEntity> = {
      payType: MerchantOrderPayTypeEnum.WECHAT,
      payStatus: MerchantOrderPayStatusEnum.PAID,
      payTime: new Date(),
    };
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
    // 给商户员工发送消息通知
    await this.sendPaySuccessNotice({
      userId,
      merchantId,
      payType: MerchantOrderPayTypeEnum.WECHAT,
      orderGoodsList: order.orderGoodsList,
    }).catch(err => this.logger.error(err));
    return true;
  }

  /**
   * 取消已付款未发货订单
   */
  async cancelPaidOrder(order: MerchantOrderEntity) {
    if (!order.id) {
      return false;
    }
    if (order.deliveryStatus === MerchantOrderDeliveryStatusEnum.DELIVERED) {
      throw new ClientOrderCancelException({ msg: '已发货订单不可取消' });
    }
    // 更新订单状态
    await this.orderEntityService.updateById(
      {
        orderStatus: MerchantOrderStatusEnum.WAIT_CANCEL,
      },
      order.id,
      order.merchantUserId,
    );
    // 发送退款申请通知给商户员工
    await this.sendCancelOrderMessage({
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
    order: MerchantOrderEntity,
    @TransactionRepository(MerchantGoodsSkuEntity)
    goodsSkuRepo?: Repository<MerchantGoodsSkuEntity>,
    @TransactionRepository(MerchantOrderEntity)
    orderRepo?: Repository<MerchantOrderEntity>,
    @TransactionRepository(MerchantOrderGoodsEntity)
    orderGoodsRepo?: Repository<MerchantOrderGoodsEntity>,
  ) {
    const orderEntityService = this.getService(orderRepo);
    if (!order.id) {
      return false;
    }
    if (!order.payStatus || !order.orderStatus) {
      order = await orderEntityService.findById(order.id);
    }
    if (
      order.payStatus !== MerchantOrderPayStatusEnum.NOT_PAID ||
      order.orderStatus !== MerchantOrderStatusEnum.IN_PROCESS
    ) {
      return false;
    }
    // 回退商品库存
    await this.merchantOrderService.goodsStockRollBack(
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
        orderStatus: MerchantOrderStatusEnum.CANCEL,
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
  async sendCancelOrderMessage(params: {
    orderNo: string;
    userId: number;
    amount: number;
    merchantId: number;
    refundType: MerchantOrderPayTypeEnum;
  }) {
    const { userId, merchantId, refundType, amount, orderNo } = params;
    const userinfo = await this.userEntityService.findById(userId, {
      select: ['nickname'],
    });
    return this.wechatTemplateService.sendCancelOrderApplyNotice(
      {
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
    error: ClientOrderPayLockedException,
  })
  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async payment(
    id: number,
    payType: MerchantOrderPayTypeEnum,
    identity: ClientIdentity,
    request: FastifyRequest,
    @TransactionRepository(MerchantGoodsEntity)
    goodsRepo?: Repository<MerchantGoodsEntity>,
    @TransactionRepository(MerchantOrderEntity)
    orderRepo?: Repository<MerchantOrderEntity>,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserPointsLogEntity)
    userPointsLogRepo?: Repository<MerchantUserPointsLogEntity>,
    @TransactionRepository(MerchantUserBalanceLogEntity)
    userBalanceLogRepo?: Repository<MerchantUserBalanceLogEntity>,
  ): Promise<ClientOrderSubmitRespDTO> {
    const { userId, merchantId } = identity;
    const order = await this.orderEntityService.findOne({
      where: {
        id,
        merchantUserId: userId,
      },
    });
    switch (payType) {
      case MerchantOrderPayTypeEnum.BALANCE:
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
      case MerchantOrderPayTypeEnum.WECHAT:
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
        throw new ClientOrderPaymentException({ msg: '请选择正确的支付方式' });
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
    order: MerchantOrderEntity,
    repositorys: {
      userRepo: Repository<MerchantUserEntity>;
      userBalanceLogRepo: Repository<MerchantUserBalanceLogEntity>;
      userPointsLogRepo: Repository<MerchantUserPointsLogEntity>;
      orderRepo: Repository<MerchantOrderEntity>;
      goodsRepo: Repository<MerchantGoodsEntity>;
    },
  ) {
    if (!order?.id) {
      throw new ClientOrderSubmitException({ msg: '无效的订单' });
    }
    if (!order.orderGoodsList) {
      order.orderGoodsList = await this.orderGoodsEntityService.find({
        select: ['totalNum', 'goodsId', 'totalPayPrice', 'name'],
        where: { orderId: order.id },
      });
    }
    if (
      order.payStatus !== MerchantOrderPayStatusEnum.NOT_PAID ||
      order.orderStatus !== MerchantOrderStatusEnum.IN_PROCESS
    ) {
      throw new ClientOrderSubmitException({ msg: '错误的订单状态' });
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
    const modifyOrderData: DeepPartial<MerchantOrderEntity> = {
      payType: MerchantOrderPayTypeEnum.BALANCE,
      payStatus: MerchantOrderPayStatusEnum.PAID,
      payTime: new Date(),
    };
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
        MerchantOrderPayTypeEnum.BALANCE,
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
    // 给商户员工发送消息通知
    await this.sendPaySuccessNotice({
      userId,
      merchantId,
      payType: MerchantOrderPayTypeEnum.BALANCE,
      orderGoodsList: order.orderGoodsList,
    }).catch(err => this.logger.error(err));
    return orderEntityService.repository.merge(order, modifyOrderData);
  }

  /**
   * 给商户员工发送消息通知
   * @param params
   */
  async sendPaySuccessNotice(params: {
    userId: number;
    merchantId: number;
    payType: MerchantOrderPayTypeEnum;
    orderGoodsList: MerchantOrderGoodsEntity[];
  }) {
    const { userId, merchantId, payType, orderGoodsList } = params;
    const [merchant, user] = await Promise.all([
      this.merchantEntityService.findById(merchantId, {
        select: ['storeName'],
      }),
      this.userEntityService.findById(userId, { select: ['nickname'] }),
    ]);
    return this.wechatTemplateService.sendBuySuccessNotice(
      orderGoodsList.map(info => ({
        payType,
        goodsName: info.name,
        amount: info.totalPayPrice,
        username: user.nickname,
        payTime: new Date(),
        merchantName: merchant.storeName,
      })),
      merchantId,
    );
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
    order: MerchantOrderEntity,
    payClientIp: string,
    { userId, openid, merchantId }: ClientIdentity,
  ) {
    if (!order?.id) {
      throw new ClientOrderSubmitException({ msg: '无效的订单' });
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
