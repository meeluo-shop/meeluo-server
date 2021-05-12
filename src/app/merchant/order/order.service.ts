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
   * 获取商品订单列表
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
      // 绑定订单用户信息
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
   * 获取订单详情
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
    // 绑定订单用户信息
    await this.merchantUserService.bindMerchantUser(
      orderInfo,
      'merchantUser',
      'merchantUserId',
    );
    return orderInfo;
  }

  /**
   * 获取地区名称
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
    // 获取省份、城市、乡镇名称
    const regionData = this.regionService.getRegionNameByCodes(regionCodes);
    orderAddress.provinceName = regionData[orderAddress.provinceCode];
    orderAddress.cityName = regionData[orderAddress.cityCode];
    orderAddress.countyName = regionData[orderAddress.countyCode];
    return orderAddress;
  }

  /**
   * 检查需要发货的订单是否有效
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
      throw new MerchantOrderGetDetailException({ msg: '错误的订单id' });
    }
    if (
      order.payStatus !== MerchantOrderPayStatusEnum.PAID ||
      order.orderStatus !== MerchantOrderStatusEnum.IN_PROCESS
    ) {
      throw new MerchantOrderGetDetailException({ msg: '错误的订单状态' });
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
      throw new MerchantOrderGetDetailException({ msg: '错误的订单商品id' });
    }
    if (orderGoods.extractClerkId) {
      throw new MerchantOrderGetDetailException({
        msg: '当前商品已发放，无法重复操作',
      });
    }
    return {
      order,
      orderGoods,
    };
  }

  /**
   * 自提订单，员工发放订单商品
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
    // 更新商品订单发放人员
    orderGoods.extractClerkId = staffId;
    await orderGoodsEntityService.updateById(
      {
        extractClerkId: staffId,
      },
      orderGoodsId,
      userId,
    );
    // 判断订单商品是否全部发放完成
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
      // 增加用户积分
      await this.merchantUserService.modifyUserPoints(
        order.merchantUserId,
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
    // 给用户发送发货通知
    await this.sendDeliveryMessage({
      orderId,
      deliveryType: order.deliveryType,
      userId: order.merchantUserId,
      merchantId,
      expressNo: '无',
      expressCompany: '无',
      orderNo: order.orderNo,
      goodsName: orderGoods.name,
    }).catch(err => this.logger.error(err));
    return true;
  }

  /**
   * 订单商品发货
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
      throw new MerchantOrderDeliverGoodsException({ msg: '错误的物流公司id' });
    }
    // 更新商品订单发货人员
    orderGoods.extractClerkId = staffId;
    await orderGoodsEntityService.updateById(
      {
        extractClerkId: staffId,
      },
      orderGoodsId,
      userId,
    );
    // 增加商品订单物流信息
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
    // 判断订单商品是否全部发放完成
    const isFinish = order.orderGoodsList.every(item => !!item.extractClerkId);
    if (isFinish) {
      // 更新订单发货状态
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
        // 给已发货订单增加定时任务，超过配置时间，自动确认收货
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
    // 给用户发送发货通知
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
   * 给用户发送发货通知
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
      address = '到店自提';
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
   * 同意取消已付款未发货订单
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
      throw new MerchantOrderGetDetailException({ msg: '错误的订单id' });
    }
    if (
      order.orderStatus !== MerchantOrderStatusEnum.WAIT_CANCEL ||
      order.payStatus !== MerchantOrderPayStatusEnum.PAID
    ) {
      throw new MerchantOrderAgreeCancelException({ msg: '错误的订单状态' });
    }
    if (order.deliveryStatus === MerchantOrderDeliveryStatusEnum.DELIVERED) {
      throw new MerchantOrderAgreeCancelException({
        msg: '已发货订单不可取消',
      });
    }
    // 回退用户积分
    await this.userPointsRollBack(
      order,
      order.merchantUserId,
      order.merchantId,
      {
        userRepo,
        userPointsLogRepo,
      },
    );
    // 回退商品库存
    await this.goodsStockRollBack(
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
      userId,
    );
    let refundType: MerchantOrderPayTypeEnum;
    // 获取微信支付证书
    const cert = await this.wechatService.getPaymentCert(merchantId);
    if (order.payType === MerchantOrderPayTypeEnum.WECHAT && cert) {
      // 判断是微信支付，并且后台已配置微信支付证书，则发起微信支付退款
      refundType = MerchantOrderPayTypeEnum.WECHAT;
      await this.wechatPayRefund(order, cert, merchantId);
    } else {
      // 判断是余额支付，或者后台未配置微信支付证书，则回退订单金额到用户余额
      refundType = MerchantOrderPayTypeEnum.BALANCE;
      await this.userBalanceRollBack(order, order.merchantUserId, merchantId, {
        userRepo,
        userBalanceLogRepo,
      });
    }
    // 发送退款成功通知
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
   * 给用户发送退款成功通知
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
   * 拒绝取消已付款未发货订单
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
      throw new MerchantOrderGetDetailException({ msg: '错误的订单id' });
    }
    if (order.orderStatus !== MerchantOrderStatusEnum.WAIT_CANCEL) {
      throw new MerchantOrderRefuseCancelException({ msg: '错误的订单状态' });
    }
    // 更新订单状态
    await this.orderEntityService.updateById(
      {
        orderStatus: MerchantOrderStatusEnum.IN_PROCESS,
      },
      orderId,
      userId,
    );
    // 发送退款失败通知
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
   * 给用户发送退款失败通知
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
   * 修改订单价格
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
      throw new MerchantOrderGetDetailException({ msg: '错误的订单id' });
    }
    if (
      order.payStatus !== MerchantOrderPayStatusEnum.NOT_PAID ||
      order.orderStatus !== MerchantOrderStatusEnum.IN_PROCESS
    ) {
      throw new MerchantOrderGetDetailException({ msg: '错误的订单状态' });
    }
    await this.orderEntityService.updateById(
      {
        orderNo: UtilHelperProvider.generateOrderNo(), // 修改订单号, 否则微信支付提示重复
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
   * 获取物流公司列表
   */
  async expressList() {
    return this.expressService.list({ pageSize: 500 });
  }

  /**
   * 往消息队列写入订单定时任务
   * @param type
   * @param data
   * @param delayTime 毫秒
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
   * 微信支付退款
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
      totalFee: fee, // 单位分，必须为整数类型
      refundFee: fee, // 单位分，必须为整数类型
      outRefundNo: order.orderNo,
    });
  }

  /**
   * 回退用户金额
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
      `订单取消：${order.orderNo}`,
      null,
      {
        userRepo,
        userBalanceLogRepo,
      },
    );
  }

  /**
   * 回退用户积分
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
      `订单取消，还原抵扣积分：${order.orderNo}`,
      null,
      {
        userRepo,
        userPointsLogRepo,
      },
    );
    return true;
  }

  /**
   * 还原商品订单库存
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
    // 删除商品redis缓存
    await Promise.all(
      orderGoodsList.map(order =>
        this.merchantGoodsService.clearDetailCache(order.goodsId, merchantId),
      ),
    );
    return true;
  }

  /**
   * 发放订单商品赠送的优惠券
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
