import { BaseService } from '@app/app.service';
import {
  Between,
  FindConditions,
  In,
  InjectService,
  Repository,
  Transaction,
  TransactionRepository,
} from '@jiaxinjiang/nest-orm';
import { Inject, Injectable } from '@nestjs/common';
import { Publisher, InjectPubliser } from '@jiaxinjiang/nest-amqp';
import {
  MerchantEntity,
  MerchantOrderReceiptStatusEnum,
  MerchantOrderStatusEnum,
  MerchantOrderPayStatusEnum,
  MerchantOrderDeliveryStatusEnum,
  MerchantOrderEntity,
  MerchantOrderGoodsEntity,
  MerchantOrderAddressEntity,
  MerchantOrderExtractEntity,
  MerchantOrderExpressEntity,
  MerchantUserEntity,
  MerchantUserPointsLogEntity,
  MerchantUserBalanceLogEntity,
  MerchantGoodsSkuEntity,
  MerchantUserBalanceModifyTypeEnum,
  MerchantUserBalanceLogSceneEnum,
  MerchantOrderPayTypeEnum,
  MerchantUserPointsModifyTypeEnum,
  MerchantOrderDeliveryTypeEnum,
  MerchantCouponEntity,
  MerchantCouponGrantEntity,
} from '@typeorm/meeluoShop';
import { UtilHelperProvider, MathHelperProvider } from '@shared/helper';
import { OrmService } from '@typeorm/orm.service';
import { AdminExpressService } from '@app/admin/express';
import { Exchanges, MEELUO_SHOP_DATABASE, Routers } from '@core/constant';
import { MerchantGoodsService } from '@app/merchant/goods';
import { MerchantOrderSettingService } from '@app/merchant/order/setting';
import {
  Message,
  OrderMessage,
  OrderMessageTypeEnum,
} from '@app/consumer/order/order.dto';
import {
  MerchantOrderGetDetailException,
  MerchantOrderDeliverGoodsException,
  MerchantOrderAgreeCancelException,
  MerchantOrderRefuseCancelException,
} from './order.exception';
import { MerchantUserService } from '../user/user.service';
import { MerchantWechatTemplateService } from '@app/merchant/wechat/template';
import {
  MerchantOrderListStatusEnum,
  MerchantOrderUpdatePriceDTO,
  MerchantOrderListDTO,
  MerchantOrderPickUpGoodsDTO,
  MerchantOrderDeliverGoodsDTO,
} from './order.dto';
import { RegionService } from '@app/common/region';
import { MerchantWechatService } from '../wechat/wechat.service';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';
import { MerchantCouponService } from '../coupon';

@Injectable()
export class MerchantOrderService extends BaseService {
  constructor(
    @InjectLogger(MerchantOrderService)
    private logger: LoggerProvider,
    @Inject(RegionService)
    private regionService: RegionService,
    @Inject(AdminExpressService)
    private expressService: AdminExpressService,
    @Inject(MerchantUserService)
    private merchantUserService: MerchantUserService,
    @Inject(MerchantWechatService)
    private wechatService: MerchantWechatService,
    @Inject(MerchantGoodsService)
    private merchantGoodsService: MerchantGoodsService,
    @Inject(MerchantCouponService)
    private merchantCouponService: MerchantCouponService,
    @Inject(MerchantWechatTemplateService)
    private wechatTemplateService: MerchantWechatTemplateService,
    @Inject(MerchantOrderSettingService)
    private merchantOrderSettingService: MerchantOrderSettingService,
    @InjectPubliser(Exchanges.ORDER_DELAY)
    private orderDelayPublisher: Publisher,
    @InjectService(MerchantEntity)
    private merchantEntityService: OrmService<MerchantEntity>,
    @InjectService(MerchantOrderEntity)
    private orderEntityService: OrmService<MerchantOrderEntity>,
    @InjectService(MerchantUserEntity)
    private userEntityService: OrmService<MerchantUserEntity>,
    @InjectService(MerchantOrderGoodsEntity)
    private orderGoodsEntityService: OrmService<MerchantOrderGoodsEntity>,
    @InjectService(MerchantOrderExtractEntity)
    private orderExtractEntityService: OrmService<MerchantOrderExtractEntity>,
    @InjectService(MerchantOrderAddressEntity)
    private orderAddressEntityService: OrmService<MerchantOrderAddressEntity>,
  ) {
    super();
  }

  /**
   * ????????????????????????
   * @param param0
   * @param merchantId
   */
  async list(
    {
      pageSize,
      pageIndex,
      status,
      orderNo,
      startTime,
      endTime,
      userId,
    }: MerchantOrderListDTO,
    merchantId: number,
    withUserInfo = false,
  ) {
    const condition: FindConditions<MerchantOrderEntity> & {
      [key: string]: any;
    } = {};
    switch (status) {
      case MerchantOrderListStatusEnum.FINISH:
        condition.orderStatus = MerchantOrderStatusEnum.SUCCESS;
        break;
      case MerchantOrderListStatusEnum.CANCELED:
        condition.orderStatus = MerchantOrderStatusEnum.CANCEL;
        break;
      case MerchantOrderListStatusEnum.WAIT_CANCELED:
        condition.orderStatus = MerchantOrderStatusEnum.WAIT_CANCEL;
        break;
      case MerchantOrderListStatusEnum.WAIT_PAY:
        condition.payStatus = MerchantOrderPayStatusEnum.NOT_PAID;
        condition.orderStatus = MerchantOrderStatusEnum.IN_PROCESS;
        break;
      case MerchantOrderListStatusEnum.WAIT_DELIVERY:
        condition.payStatus = MerchantOrderPayStatusEnum.PAID;
        condition.deliveryStatus = MerchantOrderDeliveryStatusEnum.NO_DELIVERED;
        condition.orderStatus = MerchantOrderStatusEnum.IN_PROCESS;
        break;
      case MerchantOrderListStatusEnum.WAIT_RECEIVE:
        condition.payStatus = MerchantOrderPayStatusEnum.PAID;
        condition.deliveryStatus = MerchantOrderDeliveryStatusEnum.DELIVERED;
        condition.orderStatus = MerchantOrderStatusEnum.IN_PROCESS;
        condition.receiptStatus = MerchantOrderReceiptStatusEnum.NO_RECEIPTED;
        break;
    }
    if (startTime) {
      condition.createdAt = Between(startTime, endTime || new Date());
    } else {
      condition.createdAt_lte = endTime;
    }
    const orderRecords = await this.orderEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        merchantId,
        merchantUserId: userId,
        ...condition,
        orderNo_contains: orderNo,
      },
      order: {
        id: 'DESC',
      },
    });
    if (withUserInfo) {
      // ????????????????????????
      await this.merchantUserService.bindMerchantUser(
        orderRecords.rows,
        'merchantUser',
        'merchantUserId',
      );
    }
    const orderIds = Array.from(
      new Set(orderRecords.rows.map(order => order.id)),
    );
    if (!orderIds?.length) {
      return orderRecords;
    }
    const orderGoodsList = await this.orderGoodsEntityService.find({
      where: {
        orderId: In(orderIds),
      },
    });
    orderGoodsList.forEach(goods => {
      const order = orderRecords.rows.find(val => val.id === goods.orderId);
      if (!order) {
        return;
      }
      if (!order.orderGoodsList) {
        order.orderGoodsList = [];
      }
      delete goods.content;
      order.orderGoodsList.push(goods);
    });
    return orderRecords;
  }

  /**
   * ??????????????????
   */
  async detail(id: number, merchantId: number, merchantUserId?: number) {
    const orderInfo = await this.orderEntityService.findOne({
      where: {
        id,
        merchantId,
        merchantUserId,
      },
    });
    const [orderGoodsList, orderAddress, orderExtract] = await Promise.all([
      this.orderGoodsEntityService.find({
        relations: ['orderExpress'],
        where: {
          orderId: orderInfo.id,
        },
      }),
      this.orderAddressEntityService.findOne({
        where: {
          orderId: orderInfo.id,
        },
      }),
      this.orderExtractEntityService.findOne({
        where: {
          orderId: orderInfo.id,
        },
      }),
    ]);
    orderInfo.orderGoodsList = orderGoodsList;
    orderInfo.orderAddress = orderAddress;
    orderInfo.orderExtract = orderExtract;
    if (orderInfo.orderAddress) {
      this.bindOrderAddressName(orderInfo.orderAddress);
    }
    // ????????????????????????
    await this.merchantUserService.bindMerchantUser(
      orderInfo,
      'merchantUser',
      'merchantUserId',
    );
    return orderInfo;
  }

  /**
   * ??????????????????
   * @param orderAddress
   */
  bindOrderAddressName(orderAddress: MerchantOrderAddressEntity) {
    if (!orderAddress) {
      return null;
    }
    const regionCodes: number[] = [
      orderAddress.provinceCode,
      orderAddress.cityCode,
      orderAddress.countyCode,
    ];
    // ????????????????????????????????????
    const regionData = this.regionService.getRegionNameByCodes(regionCodes);
    orderAddress.provinceName = regionData[orderAddress.provinceCode];
    orderAddress.cityName = regionData[orderAddress.cityCode];
    orderAddress.countyName = regionData[orderAddress.countyCode];
    return orderAddress;
  }

  /**
   * ???????????????????????????????????????
   * @param orderId
   * @param orderGoodsId
   * @param merchantId
   * @param orderEntityService
   * @param orderGoodsEntityService
   */
  async checkDeliverOrderId(
    orderId: number,
    orderGoodsId: number,
    merchantId: number,
    orderEntityService: OrmService<MerchantOrderEntity>,
    orderGoodsEntityService: OrmService<MerchantOrderGoodsEntity>,
  ) {
    const order = await orderEntityService.findOne({
      where: {
        id: orderId,
        merchantId,
      },
    });
    if (!order) {
      throw new MerchantOrderGetDetailException({ msg: '???????????????id' });
    }
    if (
      order.payStatus !== MerchantOrderPayStatusEnum.PAID ||
      order.orderStatus !== MerchantOrderStatusEnum.IN_PROCESS
    ) {
      throw new MerchantOrderGetDetailException({ msg: '?????????????????????' });
    }
    order.orderGoodsList = await orderGoodsEntityService.find({
      select: [
        'name',
        'extractClerkId',
        'giftCouponId',
        'merchantId',
        'merchantUserId',
        'totalNum',
      ],
      where: { orderId },
    });
    const orderGoods = order.orderGoodsList.find(
      info => info.id === orderGoodsId,
    );
    if (!orderGoods) {
      throw new MerchantOrderGetDetailException({ msg: '?????????????????????id' });
    }
    if (orderGoods.extractClerkId) {
      throw new MerchantOrderGetDetailException({
        msg: '??????????????????????????????????????????',
      });
    }
    return {
      order,
      orderGoods,
    };
  }

  /**
   * ???????????????????????????????????????
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async pickUpGoods(
    { orderGoodsId, orderId, staffId }: MerchantOrderPickUpGoodsDTO,
    userId: number,
    merchantId: number,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserPointsLogEntity)
    userPointsLogRepo?: Repository<MerchantUserPointsLogEntity>,
    @TransactionRepository(MerchantOrderEntity)
    orderRepo?: Repository<MerchantOrderEntity>,
    @TransactionRepository(MerchantOrderGoodsEntity)
    orderGoodsRepo?: Repository<MerchantOrderGoodsEntity>,
    @TransactionRepository(MerchantCouponEntity)
    couponRepo?: Repository<MerchantCouponEntity>,
    @TransactionRepository(MerchantCouponGrantEntity)
    couponGrantRepo?: Repository<MerchantCouponGrantEntity>,
  ) {
    const orderEntityService = this.getService(orderRepo);
    const orderGoodsEntityService = this.getService(orderGoodsRepo);
    const { order, orderGoods } = await this.checkDeliverOrderId(
      orderId,
      orderGoodsId,
      merchantId,
      orderEntityService,
      orderGoodsEntityService,
    );
    // ??????????????????????????????
    orderGoods.extractClerkId = staffId;
    await orderGoodsEntityService.updateById(
      {
        extractClerkId: staffId,
      },
      orderGoodsId,
      userId,
    );
    // ??????????????????????????????????????????
    const isFinish = order.orderGoodsList.every(item => !!item.extractClerkId);
    if (isFinish) {
      await orderEntityService.updateById(
        {
          deliveryStatus: MerchantOrderDeliveryStatusEnum.DELIVERED,
          deliveryTime: new Date(),
          orderStatus: MerchantOrderStatusEnum.SUCCESS,
          receiptStatus: MerchantOrderReceiptStatusEnum.RECEIPTED,
        },
        orderId,
        userId,
      );
      // ??????????????????
      await this.merchantUserService.modifyUserPoints(
        order.merchantUserId,
        merchantId,
        order.pointsBonus,
        MerchantUserPointsModifyTypeEnum.ADD,
        `???????????????????????????${order.orderNo}`,
        null,
        {
          userRepo,
          userPointsLogRepo,
        },
        false,
      );
      // ???????????????
      await this.grantOrderGoodsCoupon(
        couponRepo,
        couponGrantRepo,
        order.id,
        order.orderGoodsList,
      );
    } else {
      await orderEntityService.updateById(
        {
          deliveryStatus: MerchantOrderDeliveryStatusEnum.DELIVERED,
          deliveryTime: new Date(),
        },
        orderId,
        userId,
      );
    }
    // ???????????????????????????
    await this.sendDeliveryMessage({
      orderId,
      deliveryType: order.deliveryType,
      userId: order.merchantUserId,
      merchantId,
      expressNo: '???',
      expressCompany: '???',
      orderNo: order.orderNo,
      goodsName: orderGoods.name,
    }).catch(err => this.logger.error(err));
    return true;
  }

  /**
   * ??????????????????
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async deliverGoods(
    {
      orderGoodsId,
      orderId,
      staffId,
      expressId,
      expressNo,
    }: MerchantOrderDeliverGoodsDTO,
    userId: number,
    merchantId: number,
    @TransactionRepository(MerchantOrderEntity)
    orderRepo?: Repository<MerchantOrderEntity>,
    @TransactionRepository(MerchantOrderGoodsEntity)
    orderGoodsRepo?: Repository<MerchantOrderGoodsEntity>,
    @TransactionRepository(MerchantOrderExpressEntity)
    orderExpressRepo?: Repository<MerchantOrderExpressEntity>,
  ) {
    const orderEntityService = this.getService(orderRepo);
    const orderGoodsEntityService = this.getService(orderGoodsRepo);
    const orderExpressEntityService = this.getService(orderExpressRepo);
    const { order, orderGoods } = await this.checkDeliverOrderId(
      orderId,
      orderGoodsId,
      merchantId,
      orderEntityService,
      orderGoodsEntityService,
    );
    const express = await this.expressService.detail(expressId);
    if (!express) {
      throw new MerchantOrderDeliverGoodsException({ msg: '?????????????????????id' });
    }
    // ??????????????????????????????
    orderGoods.extractClerkId = staffId;
    await orderGoodsEntityService.updateById(
      {
        extractClerkId: staffId,
      },
      orderGoodsId,
      userId,
    );
    // ??????????????????????????????
    await orderExpressEntityService.create(
      {
        orderId: order.id,
        orderGoodsId: orderGoods.id,
        expressNo,
        expressId,
        expressCompany: express.name,
        expressCode: express.code,
        merchantId,
        merchantUserId: order.merchantUserId,
      },
      userId,
    );
    // ??????????????????????????????????????????
    const isFinish = order.orderGoodsList.every(item => !!item.extractClerkId);
    if (isFinish) {
      // ????????????????????????
      await orderEntityService.updateById(
        {
          deliveryStatus: MerchantOrderDeliveryStatusEnum.DELIVERED,
          deliveryTime: new Date(),
        },
        orderId,
        userId,
      );
      const orderSetting = await this.merchantOrderSettingService.getOrderSetting(
        merchantId,
      );
      if (orderSetting.deliveredAutoSureDay > 0) {
        // ??????????????????????????????????????????????????????????????????????????????
        await this.pushOrderDelayTask(
          OrderMessageTypeEnum.AUTO_RECEIPT_ORDER,
          {
            orderId: order.id,
            merchantId,
            userId: order.merchantUserId,
          },
          orderSetting.deliveredAutoSureDay * 24 * 3600 * 1000,
        );
      }
    }
    // ???????????????????????????
    await this.sendDeliveryMessage({
      orderId,
      userId: order.merchantUserId,
      deliveryType: order.deliveryType,
      merchantId,
      expressNo,
      expressCompany: express.name,
      orderNo: order.orderNo,
      goodsName: orderGoods.name,
    }).catch(err => this.logger.error(err));
    return true;
  }

  /**
   * ???????????????????????????
   * @param params
   */
  async sendDeliveryMessage(params: {
    orderNo: string;
    userId: number;
    expressCompany: string;
    expressNo: string;
    merchantId: number;
    goodsName: string;
    orderId: number;
    deliveryType: MerchantOrderDeliveryTypeEnum;
  }) {
    const {
      userId,
      orderNo,
      orderId,
      merchantId,
      expressCompany,
      expressNo,
      goodsName,
      deliveryType,
    } = params;
    let address = '';
    const userinfo = await this.userEntityService.findById(userId, {
      select: ['openid'],
    });
    if (deliveryType === MerchantOrderDeliveryTypeEnum.DISTRIBUTION) {
      const orderAddress = await this.orderAddressEntityService.findOne({
        where: {
          orderId,
        },
      });
      this.bindOrderAddressName(orderAddress);
      address = `${orderAddress?.name} ${orderAddress?.phone} ${orderAddress?.provinceName} ${orderAddress?.cityName} ${orderAddress?.countyName} ${orderAddress?.address}`;
    } else {
      address = '????????????';
    }
    return this.wechatTemplateService.sendOrderDeliveryNotice(
      {
        orderId,
        openid: userinfo.openid,
        orderNo,
        deliveryTime: new Date(),
        expressCompany,
        expressNo,
        goodsName,
        address,
      },
      merchantId,
    );
  }

  /**
   * ????????????????????????????????????
   */
  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async agreeCancelOrder(
    orderId: number,
    { merchantId, userId }: MerchantIdentity,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserPointsLogEntity)
    userPointsLogRepo?: Repository<MerchantUserPointsLogEntity>,
    @TransactionRepository(MerchantUserBalanceLogEntity)
    userBalanceLogRepo?: Repository<MerchantUserBalanceLogEntity>,
    @TransactionRepository(MerchantGoodsSkuEntity)
    goodsSkuRepo?: Repository<MerchantGoodsSkuEntity>,
    @TransactionRepository(MerchantOrderEntity)
    orderRepo?: Repository<MerchantOrderEntity>,
    @TransactionRepository(MerchantOrderGoodsEntity)
    orderGoodsRepo?: Repository<MerchantOrderGoodsEntity>,
  ) {
    const orderEntityService = this.getService(orderRepo);
    const order = await orderEntityService.findOne({
      where: { id: orderId, merchantId },
    });
    if (!order) {
      throw new MerchantOrderGetDetailException({ msg: '???????????????id' });
    }
    if (
      order.orderStatus !== MerchantOrderStatusEnum.WAIT_CANCEL ||
      order.payStatus !== MerchantOrderPayStatusEnum.PAID
    ) {
      throw new MerchantOrderAgreeCancelException({ msg: '?????????????????????' });
    }
    if (order.deliveryStatus === MerchantOrderDeliveryStatusEnum.DELIVERED) {
      throw new MerchantOrderAgreeCancelException({
        msg: '???????????????????????????',
      });
    }
    // ??????????????????
    await this.userPointsRollBack(
      order,
      order.merchantUserId,
      order.merchantId,
      {
        userRepo,
        userPointsLogRepo,
      },
    );
    // ??????????????????
    await this.goodsStockRollBack(
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
        orderStatus: MerchantOrderStatusEnum.CANCEL,
      },
      order.id,
      userId,
    );
    let refundType: MerchantOrderPayTypeEnum;
    // ????????????????????????
    const cert = await this.wechatService.getPaymentCert(merchantId);
    if (order.payType === MerchantOrderPayTypeEnum.WECHAT && cert) {
      // ?????????????????????????????????????????????????????????????????????????????????????????????
      refundType = MerchantOrderPayTypeEnum.WECHAT;
      await this.wechatPayRefund(order, cert, merchantId);
    } else {
      // ??????????????????????????????????????????????????????????????????????????????????????????????????????
      refundType = MerchantOrderPayTypeEnum.BALANCE;
      await this.userBalanceRollBack(order, order.merchantUserId, merchantId, {
        userRepo,
        userBalanceLogRepo,
      });
    }
    // ????????????????????????
    await this.sendCancelOrderSuccessMessage({
      merchantId,
      userId: order.merchantUserId,
      orderNo: order.orderNo,
      amount: order.payPrice,
      refundType,
      orderId: order.id,
    }).catch(err => this.logger.error(err));
    return true;
  }

  /**
   * ?????????????????????????????????
   * @param params
   */
  async sendCancelOrderSuccessMessage(params: {
    orderNo: string;
    userId: number;
    merchantId: number;
    amount: number;
    orderId: number;
    refundType: MerchantOrderPayTypeEnum;
  }) {
    const { refundType, userId, orderNo, orderId, merchantId, amount } = params;
    const [user, merchant] = await Promise.all([
      this.userEntityService.findById(userId, { select: ['openid'] }),
      this.merchantEntityService.findById(merchantId, {
        select: ['storeName'],
      }),
    ]);
    return this.wechatTemplateService.sendCancelOrderSuccessNotice(
      {
        orderId,
        openid: user.openid,
        orderNo,
        refundType,
        refundTime: new Date(),
        merchantName: merchant.storeName,
        amount,
      },
      merchantId,
    );
  }

  /**
   * ????????????????????????????????????
   * @param orderId
   * @param param1
   * @param updatePrice
   */
  async refuseCancelOrder(
    orderId: number,
    { merchantId, userId }: MerchantIdentity,
  ) {
    const order = await this.orderEntityService.findOne({
      where: { id: orderId, merchantId },
    });
    if (!order) {
      throw new MerchantOrderGetDetailException({ msg: '???????????????id' });
    }
    if (order.orderStatus !== MerchantOrderStatusEnum.WAIT_CANCEL) {
      throw new MerchantOrderRefuseCancelException({ msg: '?????????????????????' });
    }
    // ??????????????????
    await this.orderEntityService.updateById(
      {
        orderStatus: MerchantOrderStatusEnum.IN_PROCESS,
      },
      orderId,
      userId,
    );
    // ????????????????????????
    await this.sendCancelOrderFailMessage({
      merchantId,
      userId: order.merchantUserId,
      orderNo: order.orderNo,
      amount: order.payPrice,
      orderId: order.id,
    }).catch(err => this.logger.error(err));
    return true;
  }

  /**
   * ?????????????????????????????????
   * @param params
   */
  async sendCancelOrderFailMessage(params: {
    orderNo: string;
    userId: number;
    merchantId: number;
    amount: number;
    orderId: number;
  }) {
    const { userId, orderNo, orderId, merchantId, amount } = params;
    const [user, merchant] = await Promise.all([
      this.userEntityService.findById(userId, { select: ['openid'] }),
      this.merchantEntityService.findById(merchantId, {
        select: ['storeName'],
      }),
    ]);
    return this.wechatTemplateService.sendCancelOrderFailNotice(
      {
        orderId,
        openid: user.openid,
        orderNo,
        refundTime: new Date(),
        merchantName: merchant.storeName,
        amount,
      },
      merchantId,
    );
  }

  /**
   * ??????????????????
   * @param orderId
   * @param param1
   * @param param2
   */
  async updatePrice(
    orderId: number,
    { price, expressPrice }: MerchantOrderUpdatePriceDTO,
    { merchantId, userId }: MerchantIdentity,
  ) {
    const order = await this.orderEntityService.findOne({
      where: {
        id: orderId,
        merchantId,
      },
    });
    if (!order) {
      throw new MerchantOrderGetDetailException({ msg: '???????????????id' });
    }
    if (
      order.payStatus !== MerchantOrderPayStatusEnum.NOT_PAID ||
      order.orderStatus !== MerchantOrderStatusEnum.IN_PROCESS
    ) {
      throw new MerchantOrderGetDetailException({ msg: '?????????????????????' });
    }
    await this.orderEntityService.updateById(
      {
        orderNo: UtilHelperProvider.generateOrderNo(), // ???????????????, ??????????????????????????????
        updatePrice: price,
        expressPrice,
        payPrice: MathHelperProvider.add(price, expressPrice),
      },
      orderId,
      userId,
    );
    return true;
  }

  /**
   * ????????????????????????
   */
  async expressList() {
    return this.expressService.list({ pageSize: 500 });
  }

  /**
   * ???????????????????????????????????????
   * @param type
   * @param data
   * @param delayTime ??????
   */
  async pushOrderDelayTask(
    type: OrderMessageTypeEnum,
    data: OrderMessage,
    delayTime: number,
  ) {
    if (!delayTime) {
      return false;
    }
    const orderMessage: Message<OrderMessage, OrderMessageTypeEnum> = {
      type,
      data,
    };
    return this.orderDelayPublisher.publish({
      routingKey: Routers.ORDER_DELAY,
      publishOptions: {
        headers: {
          'x-delay': delayTime,
          'Content-Type': 'application/json',
        },
      },
      msg: orderMessage,
    });
  }

  /**
   * ??????????????????
   * @param order
   * @param paymentCert
   * @param merchantId
   */
  async wechatPayRefund(
    order: MerchantOrderEntity,
    paymentCert: Buffer,
    merchantId: number,
  ) {
    const payment = await this.wechatService.getPayment({
      merchantId,
      cert: paymentCert,
    });
    const fee = parseInt(
      MathHelperProvider.multiply(Number(order.payPrice) || 0, 100).toString(),
    );
    return payment.refund.byOutTradeNumber({
      outTradeNo: order.orderNo,
      totalFee: fee, // ?????????????????????????????????
      refundFee: fee, // ?????????????????????????????????
      outRefundNo: order.orderNo,
    });
  }

  /**
   * ??????????????????
   */
  async userBalanceRollBack(
    order: MerchantOrderEntity,
    userId: number,
    merchantId: number,
    repositorys: {
      userRepo: Repository<MerchantUserEntity>;
      userBalanceLogRepo: Repository<MerchantUserBalanceLogEntity>;
    },
  ) {
    const { userRepo, userBalanceLogRepo } = repositorys;
    return this.merchantUserService.modifyUserBalance(
      userId,
      merchantId,
      order.payPrice,
      MerchantUserBalanceModifyTypeEnum.ADD,
      MerchantUserBalanceLogSceneEnum.ORDER_REFUND,
      MerchantOrderPayTypeEnum.BALANCE,
      `???????????????${order.orderNo}`,
      null,
      {
        userRepo,
        userBalanceLogRepo,
      },
    );
  }

  /**
   * ??????????????????
   */
  async userPointsRollBack(
    order: MerchantOrderEntity,
    userId: number,
    merchantId: number,
    repositorys: {
      userRepo: Repository<MerchantUserEntity>;
      userPointsLogRepo: Repository<MerchantUserPointsLogEntity>;
    },
  ) {
    const { userRepo, userPointsLogRepo } = repositorys;
    await this.merchantUserService.modifyUserPoints(
      userId,
      merchantId,
      order.pointsNum,
      MerchantUserPointsModifyTypeEnum.ADD,
      `????????????????????????????????????${order.orderNo}`,
      null,
      {
        userRepo,
        userPointsLogRepo,
      },
    );
    return true;
  }

  /**
   * ????????????????????????
   * @param orderId
   * @param userId
   * @param repositorys
   */
  async goodsStockRollBack(
    orderId: number,
    userId: number,
    merchantId: number,
    repositorys: {
      goodsSkuRepo: Repository<MerchantGoodsSkuEntity>;
      orderGoodsRepo: Repository<MerchantOrderGoodsEntity>;
    },
  ) {
    const { goodsSkuRepo, orderGoodsRepo } = repositorys;
    const orderGoodsEntityService = this.getService(orderGoodsRepo);
    const orderGoodsList = await orderGoodsEntityService.find({
      select: ['goodsId', 'specSkuId', 'totalNum'],
      where: {
        orderId,
        merchantUserId: userId,
      },
    });
    await Promise.all(
      orderGoodsList.map(order =>
        goodsSkuRepo.increment(
          { goodsId: order.goodsId, specSkuId: order.specSkuId },
          'stock',
          order.totalNum,
        ),
      ),
    );
    // ????????????redis??????
    await Promise.all(
      orderGoodsList.map(order =>
        this.merchantGoodsService.clearDetailCache(order.goodsId, merchantId),
      ),
    );
    return true;
  }

  /**
   * ????????????????????????????????????
   * @param orderId
   */
  async grantOrderGoodsCoupon(
    couponRepo: Repository<MerchantCouponEntity>,
    couponGrantRepo: Repository<MerchantCouponGrantEntity>,
    orderId: number,
    orderGoodsList?: MerchantOrderGoodsEntity[],
  ) {
    if (!orderGoodsList) {
      orderGoodsList = await this.orderGoodsEntityService.find({
        select: ['giftCouponId', 'merchantId', 'merchantUserId', 'totalNum'],
        where: {
          orderId,
        },
      });
    }
    const couponOrderList = orderGoodsList.filter(item => !!item.giftCouponId);
    if (couponOrderList.length) {
      await Promise.all(
        couponOrderList.map(order =>
          this.merchantCouponService.grant(
            {
              merchantUserId: order.merchantUserId,
              merchantId: order.merchantId,
              couponId: order.giftCouponId,
              grantNum: order.totalNum,
            },
            couponRepo,
            couponGrantRepo,
          ),
        ),
      );
    }
  }
}
