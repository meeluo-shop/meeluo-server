import * as moment from 'moment';
import * as lodash from 'lodash';
import { BaseService } from '@app/app.service';
import {
  Not,
  Between,
  FindConditions,
  In,
  InjectService,
  Repository,
  Transaction,
  TransactionRepository,
} from '@jiaxinjiang/nest-orm';
import { Inject, Injectable } from '@nestjs/common';
import {
  MerchantEntity,
  MerchantMenuOrderReceiptStatusEnum,
  MerchantMenuOrderStatusEnum,
  MerchantMenuOrderPayStatusEnum,
  MerchantMenuOrderDeliveryStatusEnum,
  MerchantMenuOrderEntity,
  MerchantMenuOrderGoodsEntity,
  MerchantUserEntity,
  MerchantUserPointsLogEntity,
  MerchantUserBalanceLogEntity,
  MerchantGoodsSkuEntity,
  MerchantUserBalanceModifyTypeEnum,
  MerchantUserBalanceLogSceneEnum,
  MerchantMenuOrderPayTypeEnum,
  MerchantUserPointsModifyTypeEnum,
  MerchantCouponEntity,
  MerchantCouponGrantEntity,
  MerchantGoodsEntity,
  MerchantTableEntity,
} from '@typeorm/meeluoShop';
import { MERCHANT_RESTAURANT_NO_PREFIX } from '@core/constant';
import {
  UtilHelperProvider,
  MathHelperProvider,
  DateHelperProvider,
} from '@shared/helper';
import { OrmService } from '@typeorm/orm.service';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  MerchantGoodsService,
  MerchantGoodsSpecService,
} from '@app/merchant/goods';
import { MerchantUserGradeService } from '@app/merchant/user/grade';
import {
  MerchantMenuSettingService,
  MerchantMenuPayTypeEnum,
  MerchantMenuOrderSettingDTO,
} from '@app/merchant/menu/setting';
import {
  MerchantMenuOrderGetDetailException,
  MerchantMenuOrderAgreeCancelException,
  MerchantMenuOrderRefuseCancelException,
  MerchantMenuOrderIsPaidException,
  MerchantMenuOrderLackOfStockException,
  MerchantMenuOrderInvalidTableException,
} from './order.exception';
import { MerchantUserService } from '@app/merchant/user/user.service';
import { MerchantWechatTemplateService } from '@app/merchant/wechat/template';
import {
  MerchantMenuOrderListStatusEnum,
  MerchantMenuOrderUpdatePriceDTO,
  MerchantMenuOrderListDTO,
  MerchantMenuOrderServingDTO,
  MerchantMenuOrderGoodsSkusDTO,
  MerchantMenuOrderSubmitDTO,
} from './order.dto';
import { MerchantWechatService } from '@app/merchant/wechat/wechat.service';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';
import {
  MerchantDevicePrinterService,
  PrintTypeEnum,
} from '@app/merchant/device/printer';
import { MerchantCouponService } from '@app/merchant/coupon';
import { MerchantMenuOrderGoodsInfo } from './order.interface';
import { CacheProvider } from '@jiaxinjiang/nest-redis';
import { ResourceService } from '@app/common/resource';
import { MerchantOrderService } from '@app/merchant/order';
import { OrderMessageTypeEnum } from '@app/consumer/order/order.dto';

@Injectable()
export class MerchantMenuOrderService extends BaseService {
  constructor(
    @InjectLogger(MerchantMenuOrderService)
    private logger: LoggerProvider,
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @Inject(ResourceService)
    private resourceService: ResourceService,
    @Inject(MerchantCouponService)
    private merchantCouponService: MerchantCouponService,
    @Inject(MerchantUserService)
    private merchantUserService: MerchantUserService,
    @Inject(MerchantOrderService)
    private merchantOrderService: MerchantOrderService,
    @Inject(MerchantMenuSettingService)
    private merchantMenuSettingService: MerchantMenuSettingService,
    @Inject(MerchantDevicePrinterService)
    private devicePrinterService: MerchantDevicePrinterService,
    @Inject(MerchantWechatService)
    private wechatService: MerchantWechatService,
    @Inject(MerchantUserGradeService)
    private merchantGradeService: MerchantUserGradeService,
    @Inject(MerchantGoodsService)
    private merchantGoodsService: MerchantGoodsService,
    @Inject(MerchantGoodsSpecService)
    private merchantGoodsSpecService: MerchantGoodsSpecService,
    @Inject(MerchantWechatTemplateService)
    private wechatTemplateService: MerchantWechatTemplateService,
    @InjectService(MerchantEntity)
    private merchantEntityService: OrmService<MerchantEntity>,
    @InjectService(MerchantGoodsEntity)
    private goodsEntityService: OrmService<MerchantGoodsEntity>,
    @InjectService(MerchantGoodsSkuEntity)
    private goodsSkuEntityService: OrmService<MerchantGoodsSkuEntity>,
    @InjectService(MerchantMenuOrderEntity)
    private orderEntityService: OrmService<MerchantMenuOrderEntity>,
    @InjectService(MerchantUserEntity)
    private userEntityService: OrmService<MerchantUserEntity>,
    @InjectService(MerchantMenuOrderGoodsEntity)
    private orderGoodsEntityService: OrmService<MerchantMenuOrderGoodsEntity>,
  ) {
    super();
  }

  /**
   * 获取点餐订单列表
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
      tableId,
    }: MerchantMenuOrderListDTO,
    merchantId: number,
    withUserInfo = false,
  ) {
    const condition: FindConditions<MerchantMenuOrderEntity> & {
      [key: string]: any;
    } = {};
    switch (status) {
      case MerchantMenuOrderListStatusEnum.FINISH:
        condition.orderStatus = MerchantMenuOrderStatusEnum.SUCCESS;
        break;
      case MerchantMenuOrderListStatusEnum.CANCELED:
        condition.orderStatus = MerchantMenuOrderStatusEnum.CANCEL;
        break;
      case MerchantMenuOrderListStatusEnum.WAIT_CANCELED:
        condition.orderStatus = MerchantMenuOrderStatusEnum.WAIT_CANCEL;
        break;
      case MerchantMenuOrderListStatusEnum.WAIT_PAY:
        condition.orderStatus = MerchantMenuOrderStatusEnum.IN_PROCESS;
        condition.payStatus = Not(MerchantMenuOrderPayStatusEnum.PAID);
        break;
      case MerchantMenuOrderListStatusEnum.WAIT_COLLECT:
        condition.payStatus = MerchantMenuOrderPayStatusEnum.OFFLINE_PAY;
        condition.deliveryStatus =
          MerchantMenuOrderDeliveryStatusEnum.NO_DELIVERED;
        condition.orderStatus = MerchantMenuOrderStatusEnum.IN_PROCESS;
        break;
      case MerchantMenuOrderListStatusEnum.WAIT_DELIVERY:
        condition.payStatus = Not(MerchantMenuOrderPayStatusEnum.NOT_PAID);
        condition.deliveryStatus =
          MerchantMenuOrderDeliveryStatusEnum.NO_DELIVERED;
        condition.orderStatus = MerchantMenuOrderStatusEnum.IN_PROCESS;
        break;
      case MerchantMenuOrderListStatusEnum.WAIT_RECEIVE:
        condition.payStatus = Not(MerchantMenuOrderPayStatusEnum.NOT_PAID);
        condition.deliveryStatus =
          MerchantMenuOrderDeliveryStatusEnum.DELIVERED;
        condition.orderStatus = MerchantMenuOrderStatusEnum.IN_PROCESS;
        condition.receiptStatus =
          MerchantMenuOrderReceiptStatusEnum.NO_RECEIPTED;
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
        tableId,
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
    orderInfo.orderGoodsList = await this.orderGoodsEntityService.find({
      where: {
        orderId: orderInfo.id,
      },
    });

    // 绑定订单用户信息
    await this.merchantUserService.bindMerchantUser(
      orderInfo,
      'merchantUser',
      'merchantUserId',
    );
    return orderInfo;
  }

  /**
   * 检验商品库存情况
   * @param goodsList
   */
  validateGoodsStockNum(goodsList: MerchantMenuOrderGoodsInfo[]) {
    for (const goods of goodsList) {
      if (goods.goodsNum > goods.skus[0].stock) {
        throw new MerchantMenuOrderLackOfStockException({
          msg: `很抱歉，商品 “${goods.name}” 库存不足`,
        });
      }
    }
  }

  /**
   * 计算商品会员折扣价
   * @param goodsList
   * @param userId
   * @param merchantId
   */
  async setOrderGoodsGradeMoney(
    goodsList: MerchantMenuOrderGoodsInfo[],
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
   * 计算订单商品的实际付款金额
   */
  setOrderGoodsPayPrice(goodsList: MerchantMenuOrderGoodsInfo[]) {
    let orderGoodsPrice = 0;
    let goodsTotalPrice = 0;
    // 商品总价 - 优惠抵扣
    for (const goods of goodsList) {
      // 会员价格减去积分抵扣金额
      goods.totalPayPrice = MathHelperProvider.subtract(
        goods.totalPrice,
        MathHelperProvider.add(goods.couponMoney, goods.pointsMoney),
      ) as number;
      goodsTotalPrice = MathHelperProvider.add(
        goodsTotalPrice,
        goods.totalPrice,
      ) as number;
      orderGoodsPrice = MathHelperProvider.add(
        orderGoodsPrice,
        goods.totalPayPrice,
      ) as number;
    }
    return {
      goodsTotalPrice,
      orderGoodsPrice,
    };
  }

  /**
   * 生成订单排号
   * @param merchantId
   * @param baseNum
   * @returns
   */
  async generateRowNo(merchantId: number, baseNum = 100) {
    const surplusTime = DateHelperProvider.getTodaySurplus();
    // 访客进出记录数量+1
    const count = await this.cacheProvider.incr(
      `${MERCHANT_RESTAURANT_NO_PREFIX}:${merchantId}`,
      surplusTime,
    );
    return count + baseNum;
  }

  /**
   * 定时自动完成订单
   * @param orderSetting
   */
  async delayAutoCompleteOrder({
    orderId,
    userId,
    merchantId,
    orderSetting,
  }: {
    orderId: number;
    userId: number;
    merchantId: number;
    orderSetting?: MerchantMenuOrderSettingDTO;
  }) {
    if (!orderSetting) {
      // 获取点餐订单流程配置
      orderSetting = await this.merchantMenuSettingService.getOrderSetting(
        merchantId,
      );
    }
    if (orderSetting.finishedAutoSureHour > 0) {
      // 给餐后付款的订单增加定时任务，超过配置时间，自动完成
      await this.merchantOrderService.pushOrderDelayTask(
        OrderMessageTypeEnum.AUTO_COMPLETE_MENU_ORDER,
        {
          orderId,
          merchantId,
          userId,
        },
        orderSetting.finishedAutoSureHour * 3600 * 1000,
      );
    }
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
  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async submit(
    { goodsSkus, tableId, people, payType, userId }: MerchantMenuOrderSubmitDTO,
    identity: MerchantIdentity,
    @TransactionRepository(MerchantGoodsSkuEntity)
    goodsSkuRepo?: Repository<MerchantGoodsSkuEntity>,
    @TransactionRepository(MerchantMenuOrderEntity)
    orderRepo?: Repository<MerchantMenuOrderEntity>,
    @TransactionRepository(MerchantMenuOrderGoodsEntity)
    orderGoodsRepo?: Repository<MerchantMenuOrderGoodsEntity>,
    @TransactionRepository(MerchantTableEntity)
    tableRepo?: Repository<MerchantTableEntity>,
    @TransactionRepository(MerchantGoodsEntity)
    goodsRepo?: Repository<MerchantGoodsEntity>,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserBalanceLogEntity)
    userBalanceLogRepo?: Repository<MerchantUserBalanceLogEntity>,
  ): Promise<MerchantMenuOrderEntity> {
    const { merchantId, userId: staffId } = identity;
    const userEntityService = this.getService(userRepo);
    const tableEntityService = this.getService(tableRepo);
    const orderEntityService = this.getService(orderRepo);
    const orderGoodsEntityService = this.getService(orderGoodsRepo);
    const goodsList = await this.getOrderGoodsData(goodsSkus, merchantId);
    // 检查库存
    this.validateGoodsStockNum(goodsList);
    let userinfo: MerchantUserEntity = null;
    if (userId) {
      userinfo = await userEntityService.findOne({
        select: ['point', 'balance', 'gradeId', 'merchantId'],
        where: {
          id: userId,
          merchantId,
        },
      });
    }
    const tableInfo = await tableEntityService.findOne({
      where: {
        id: tableId,
        merchantId,
      },
    });
    if (!tableInfo) {
      throw new MerchantMenuOrderInvalidTableException();
    }
    if (userinfo) {
      // 计算会员折扣
      await this.setOrderGoodsGradeMoney(goodsList, userinfo);
    }
    // 计算商品会员折扣后的总金额
    for (const goods of goodsList) {
      goods.totalPrice = MathHelperProvider.multiply(
        goods.gradeGoodsPrice || goods.skus[0].price,
        goods.goodsNum,
      );
    }
    // 获取点餐订单流程配置
    const orderSetting = await this.merchantMenuSettingService.getOrderSetting(
      merchantId,
    );
    // 计算订单商品的实际付款金额
    const { orderGoodsPrice, goodsTotalPrice } = this.setOrderGoodsPayPrice(
      goodsList,
    );
    // 计算餐具/调料费
    const wareFee = MathHelperProvider.multiply(tableInfo.wareFee, people);
    const orderPayPrice = MathHelperProvider.add(orderGoodsPrice, wareFee) || 0;
    let paymentType: MerchantMenuOrderPayTypeEnum;
    let payStatus: MerchantMenuOrderPayStatusEnum =
      MerchantMenuOrderPayStatusEnum.PAID;
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
    const rowNo = await this.generateRowNo(merchantId);
    // 创建订单记录
    const order = await orderEntityService.create(
      {
        people,
        rowNo,
        orderNo: UtilHelperProvider.generateOrderNo(),
        totalPrice: goodsTotalPrice,
        orderPrice: orderGoodsPrice,
        payPrice: orderPayPrice,
        tableId,
        tableName: tableInfo.name,
        payStatus,
        payType: paymentType,
        wareFee,
        merchantId,
        merchantUserId: userId,
      },
      staffId,
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
      staffId,
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
    if (
      payType === MerchantMenuPayTypeEnum.BALANCE &&
      userinfo?.id &&
      order.payPrice > 0
    ) {
      // 扣除用户余额
      await this.merchantUserService.modifyUserBalance(
        userinfo?.id,
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
    const goodsSalesList: Array<{ id: number; total: number }> = [];
    order.orderGoodsList.forEach(goods => {
      const item = goodsSalesList.find(val => val.id === goods.goodsId);
      if (item) {
        item.total = MathHelperProvider.add(item.total, goods.totalNum);
      } else {
        goodsSalesList.push({ id: goods.goodsId, total: goods.totalNum });
      }
    });
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
    await this.sendSubmitMenuNotify({
      merchantId,
      order,
      orderGoodsList: order.orderGoodsList,
    }).catch(err => this.logger.error(err));
    // 打印订单小票
    await this.printOrder(order.id, merchantId, order);
    // 给订单增加定时任务，超过配置时间，自动完成
    await this.delayAutoCompleteOrder({
      orderId: order.id,
      userId: staffId,
      merchantId,
      orderSetting,
    });
    // 清除订单商品缓存
    await Promise.all(
      Array.from(new Set(goodsList.map(val => val.id))).map(id =>
        this.merchantGoodsService.clearDetailCache(id, merchantId),
      ),
    );
    delete order.orderGoodsList;
    return order;
  }

  /**
   * 发送下单通知给员工
   * @param params
   */
  async sendSubmitMenuNotify(params: {
    merchantId: number;
    order: MerchantMenuOrderEntity;
    orderGoodsList: MerchantMenuOrderGoodsEntity[];
  }) {
    const { order, orderGoodsList, merchantId } = params;
    const goodsNames: string[] = [];
    orderGoodsList.forEach(goods => {
      goodsNames.push(
        `${goods.name}${goods.specs ? `（${goods.specs}）` : ''}✕ ${
          goods.totalNum
        }`,
      );
    });
    return this.wechatTemplateService.sendSubmitMenuNotify(
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
      },
      merchantId,
    );
  }

  /**
   * 获取订单商品规格属性
   * @param goodsSkus
   * @param merchantId
   */
  async getOrderGoodsData(
    goodsSkus: MerchantMenuOrderGoodsSkusDTO[],
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
    const goodsRecords: Array<MerchantMenuOrderGoodsInfo> = [];
    for (const goodsSku of goodsSkus) {
      const goods = goodsList.find(
        val => val.id === goodsSku.goodsId,
      ) as MerchantMenuOrderGoodsInfo;
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
      goodsRecord.weight = 0;
      goodsRecord.couponMoney = 0;
      goodsRecord.specs = '';
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
   * 检查当前订单是否是正常交易中
   * @param orderId
   * @param merchantId
   * @param orderEntityService
   * @returns
   */
  async checkProcessOrderId(
    orderId: number,
    merchantId: number,
    orderEntityService: OrmService<MerchantMenuOrderEntity>,
  ) {
    const order = await orderEntityService.findOne({
      where: {
        id: orderId,
        merchantId,
      },
    });
    if (!order) {
      throw new MerchantMenuOrderGetDetailException({ msg: '错误的订单id' });
    }
    if (
      order.payStatus === MerchantMenuOrderPayStatusEnum.NOT_PAID ||
      order.orderStatus !== MerchantMenuOrderStatusEnum.IN_PROCESS
    ) {
      throw new MerchantMenuOrderGetDetailException({ msg: '错误的订单状态' });
    }
    return order;
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
    orderEntityService: OrmService<MerchantMenuOrderEntity>,
    orderGoodsEntityService: OrmService<MerchantMenuOrderGoodsEntity>,
  ) {
    const order = await this.checkProcessOrderId(
      orderId,
      merchantId,
      orderEntityService,
    );
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
      throw new MerchantMenuOrderGetDetailException({
        msg: '错误的订单商品id',
      });
    }
    if (orderGoods.extractClerkId) {
      throw new MerchantMenuOrderGetDetailException({
        msg: '当前菜品已上餐，无法重复操作',
      });
    }
    return order;
  }

  /**
   * 设置线下付款订单为已付款
   * @param param0
   */
  async setPaid({
    orderId,
    staffId,
    merchantId,
  }: {
    orderId: number;
    staffId: number;
    merchantId: number;
  }) {
    const order = await this.orderEntityService.findOne({
      where: {
        id: orderId,
        merchantId,
      },
    });
    if (!order) {
      throw new MerchantMenuOrderGetDetailException({ msg: '错误的订单id' });
    }
    // 判断是否是线下付款订单
    if (
      order.orderStatus !== MerchantMenuOrderStatusEnum.IN_PROCESS &&
      order.payStatus !== MerchantMenuOrderPayStatusEnum.OFFLINE_PAY
    ) {
      throw new MerchantMenuOrderGetDetailException({ msg: '错误的订单状态' });
    }
    if (order.payStatus === MerchantMenuOrderPayStatusEnum.PAID) {
      throw new MerchantMenuOrderIsPaidException();
    }
    // 设置订单状态为已支付
    await this.orderEntityService.updateById(
      {
        payStatus: MerchantMenuOrderPayStatusEnum.PAID,
      },
      orderId,
      staffId,
    );
    return true;
  }

  /**
   * 设置为已上餐
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async serving(
    { orderGoodsId, orderId }: MerchantMenuOrderServingDTO,
    userId: number,
    merchantId: number,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserPointsLogEntity)
    userPointsLogRepo?: Repository<MerchantUserPointsLogEntity>,
    @TransactionRepository(MerchantMenuOrderEntity)
    orderRepo?: Repository<MerchantMenuOrderEntity>,
    @TransactionRepository(MerchantMenuOrderGoodsEntity)
    orderGoodsRepo?: Repository<MerchantMenuOrderGoodsEntity>,
    @TransactionRepository(MerchantCouponEntity)
    couponRepo?: Repository<MerchantCouponEntity>,
    @TransactionRepository(MerchantCouponGrantEntity)
    couponGrantRepo?: Repository<MerchantCouponGrantEntity>,
  ) {
    const orderEntityService = this.getService(orderRepo);
    const orderGoodsEntityService = this.getService(orderGoodsRepo);
    const order = await this.checkDeliverOrderId(
      orderId,
      orderGoodsId,
      merchantId,
      orderEntityService,
      orderGoodsEntityService,
    );
    await orderGoodsEntityService.updateById(
      {
        extractClerkId: userId,
      },
      orderGoodsId,
      userId,
    );
    const orderGoods = order.orderGoodsList.find(
      item => item.id === orderGoodsId,
    );
    orderGoods.extractClerkId = userId;
    // 判断订单菜单是否全部上餐完成
    const isFinish = order.orderGoodsList.every(item => !!item.extractClerkId);
    // 判断菜单全部上餐，并且用户已经支付，直接完成订单
    if (isFinish && order.payStatus === MerchantMenuOrderPayStatusEnum.PAID) {
      // 判断用户已经支付，直接完成订单
      await orderEntityService.updateById(
        {
          deliveryStatus: MerchantMenuOrderDeliveryStatusEnum.DELIVERED,
          deliveryTime: new Date(),
          orderStatus: MerchantMenuOrderStatusEnum.SUCCESS,
          receiptStatus: MerchantMenuOrderReceiptStatusEnum.RECEIPTED,
          receiptTime: new Date(),
        },
        orderId,
        userId,
      );
      if (order.merchantUserId) {
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
      }
    } else if (isFinish) {
      // 如果只是已上餐，未付款，修改订单状态为已上餐
      await orderEntityService.updateById(
        {
          deliveryStatus: MerchantMenuOrderDeliveryStatusEnum.DELIVERED,
          deliveryTime: new Date(),
        },
        orderId,
        userId,
      );
    }
    return true;
  }

  /**
   * 商家确认完成订单
   * @param param0
   * @param userId
   * @param merchantId
   * @param staffId
   * @param userRepo
   * @param userPointsLogRepo
   * @param orderRepo
   * @param orderGoodsRepo
   * @returns
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async complete(
    id: number,
    userId: number,
    merchantId: number,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserPointsLogEntity)
    userPointsLogRepo?: Repository<MerchantUserPointsLogEntity>,
    @TransactionRepository(MerchantMenuOrderEntity)
    orderRepo?: Repository<MerchantMenuOrderEntity>,
    @TransactionRepository(MerchantMenuOrderGoodsEntity)
    orderGoodsRepo?: Repository<MerchantMenuOrderGoodsEntity>,
    @TransactionRepository(MerchantCouponEntity)
    couponRepo?: Repository<MerchantCouponEntity>,
    @TransactionRepository(MerchantCouponGrantEntity)
    couponGrantRepo?: Repository<MerchantCouponGrantEntity>,
  ) {
    const orderEntityService = this.getService(orderRepo);
    const orderGoodsEntityService = this.getService(orderGoodsRepo);
    const order = await this.checkProcessOrderId(
      id,
      merchantId,
      orderEntityService,
    );
    // 把订单所有菜设为已上餐
    await orderGoodsEntityService.update(
      {
        extractClerkId: userId,
      },
      { orderId: id },
      userId,
    );
    // 更新订单状态
    await orderEntityService.updateById(
      {
        deliveryStatus: MerchantMenuOrderDeliveryStatusEnum.DELIVERED,
        deliveryTime: new Date(),
        orderStatus: MerchantMenuOrderStatusEnum.SUCCESS,
        receiptStatus: MerchantMenuOrderReceiptStatusEnum.RECEIPTED,
        payStatus: MerchantMenuOrderPayStatusEnum.PAID,
        receiptTime: new Date(),
      },
      id,
      userId,
    );
    if (order.merchantUserId) {
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
      await this.grantOrderGoodsCoupon(couponRepo, couponGrantRepo, order.id);
    }
    return true;
  }

  /**
   * 同意取消已付款未上餐订单
   */
  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async agreeCancelOrder(
    orderId: number,
    userId: number,
    merchantId: number,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserPointsLogEntity)
    userPointsLogRepo?: Repository<MerchantUserPointsLogEntity>,
    @TransactionRepository(MerchantUserBalanceLogEntity)
    userBalanceLogRepo?: Repository<MerchantUserBalanceLogEntity>,
    @TransactionRepository(MerchantGoodsSkuEntity)
    goodsSkuRepo?: Repository<MerchantGoodsSkuEntity>,
    @TransactionRepository(MerchantMenuOrderEntity)
    orderRepo?: Repository<MerchantMenuOrderEntity>,
    @TransactionRepository(MerchantMenuOrderGoodsEntity)
    orderGoodsRepo?: Repository<MerchantMenuOrderGoodsEntity>,
  ) {
    const orderEntityService = this.getService(orderRepo);
    const order = await orderEntityService.findOne({
      where: { id: orderId, merchantId },
    });
    if (!order) {
      throw new MerchantMenuOrderGetDetailException({ msg: '错误的订单id' });
    }
    if (
      order.orderStatus !== MerchantMenuOrderStatusEnum.WAIT_CANCEL ||
      order.payStatus !== MerchantMenuOrderPayStatusEnum.PAID
    ) {
      throw new MerchantMenuOrderAgreeCancelException({
        msg: '错误的订单状态',
      });
    }
    if (
      order.deliveryStatus === MerchantMenuOrderDeliveryStatusEnum.DELIVERED
    ) {
      throw new MerchantMenuOrderAgreeCancelException({
        msg: '已上餐订单不可取消',
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
        orderStatus: MerchantMenuOrderStatusEnum.CANCEL,
      },
      order.id,
      userId,
    );
    let refundType: MerchantMenuOrderPayTypeEnum;
    // 获取微信支付证书
    const cert = await this.wechatService.getPaymentCert(merchantId);
    if (order.payType === MerchantMenuOrderPayTypeEnum.WECHAT && cert) {
      // 判断是微信支付，并且后台已配置微信支付证书，则发起微信支付退款
      refundType = MerchantMenuOrderPayTypeEnum.WECHAT;
      await this.wechatPayRefund(order, cert, merchantId);
    } else {
      // 判断是余额支付，或者后台未配置微信支付证书，则回退订单金额到用户余额
      refundType = MerchantMenuOrderPayTypeEnum.BALANCE;
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
    refundType: MerchantMenuOrderPayTypeEnum;
  }) {
    const { refundType, userId, orderNo, orderId, merchantId, amount } = params;
    const [user, merchant] = await Promise.all([
      this.userEntityService.findById(userId, { select: ['openid'] }),
      this.merchantEntityService.findById(merchantId, {
        select: ['storeName'],
      }),
    ]);
    return this.wechatTemplateService.sendCancelMenuOrderSuccessNotice(
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
   * 拒绝取消已付款未上餐订单
   * @param orderId
   * @param param1
   * @param updatePrice
   */
  async refuseCancelOrder(orderId: number, userId: number, merchantId: number) {
    const order = await this.orderEntityService.findOne({
      where: { id: orderId, merchantId },
    });
    if (!order) {
      throw new MerchantMenuOrderGetDetailException({ msg: '错误的订单id' });
    }
    if (order.orderStatus !== MerchantMenuOrderStatusEnum.WAIT_CANCEL) {
      throw new MerchantMenuOrderRefuseCancelException({
        msg: '错误的订单状态',
      });
    }
    // 更新订单状态
    await this.orderEntityService.updateById(
      {
        orderStatus: MerchantMenuOrderStatusEnum.IN_PROCESS,
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
    return this.wechatTemplateService.sendCancelMenuOrderFailNotice(
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
    { price }: MerchantMenuOrderUpdatePriceDTO,
    { merchantId, userId }: MerchantIdentity,
  ) {
    const order = await this.orderEntityService.findOne({
      where: {
        id: orderId,
        merchantId,
      },
    });
    if (!order) {
      throw new MerchantMenuOrderGetDetailException({ msg: '错误的订单id' });
    }
    if (
      order.payStatus === MerchantMenuOrderPayStatusEnum.PAID ||
      order.orderStatus !== MerchantMenuOrderStatusEnum.IN_PROCESS
    ) {
      throw new MerchantMenuOrderGetDetailException({ msg: '错误的订单状态' });
    }
    await this.orderEntityService.updateById(
      {
        orderNo: UtilHelperProvider.generateOrderNo(), // 修改订单号, 否则微信支付提示重复
        updatePrice: price,
        payPrice: MathHelperProvider.add(price, order.wareFee),
      },
      orderId,
      userId,
    );
    return true;
  }

  /**
   * 微信支付退款
   * @param order
   * @param paymentCert
   * @param merchantId
   */
  async wechatPayRefund(
    order: MerchantMenuOrderEntity,
    paymentCert: Buffer,
    merchantId: number,
  ) {
    const payment = await this.wechatService.getPayment({
      merchantId,
      cert: paymentCert,
    });
    const fee = parseInt(
      MathHelperProvider.multiply(order.payPrice || 0, 100).toString(),
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
    order: MerchantMenuOrderEntity,
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
      MerchantMenuOrderPayTypeEnum.BALANCE,
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
    order: MerchantMenuOrderEntity,
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
      orderGoodsRepo: Repository<MerchantMenuOrderGoodsEntity>;
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
   * 打印订单小票
   * @param orderId
   * @param merchantId
   */
  async printOrder(
    orderId: number,
    merchantId: number,
    menuOrder?: MerchantMenuOrderEntity,
  ) {
    let order: MerchantMenuOrderEntity = menuOrder;
    if (!order) {
      order = await this.orderEntityService.findOne({
        where: {
          id: orderId,
          merchantId,
        },
      });
      order.orderGoodsList = await this.orderGoodsEntityService.find({
        where: {
          orderId,
          merchantId,
        },
      });
    }
    const orderContent = this.getMenuOrderTemplate(order);
    await this.devicePrinterService.print({
      printType: PrintTypeEnum.TEXT,
      content: orderContent,
      originId: order.id,
      merchantId,
    });
    return true;
  }

  /**
   * 获取支付类型
   * @param payType
   * @param payStatus
   * @returns
   */
  getRefundType(
    payType: MerchantMenuOrderPayTypeEnum,
    payStatus: MerchantMenuOrderPayStatusEnum,
  ) {
    if (payStatus === MerchantMenuOrderPayStatusEnum.OFFLINE_PAY) {
      return '餐后支付';
    }
    if (payStatus === MerchantMenuOrderPayStatusEnum.NOT_PAID) {
      return '未支付';
    }
    switch (payType) {
      case MerchantMenuOrderPayTypeEnum.BALANCE:
        return '余额支付';
      case MerchantMenuOrderPayTypeEnum.WECHAT:
        return '微信支付';
      default:
        return '异常支付';
    }
  }

  /**
   * 获取点餐订单文本打印模版
   * @param data
   * @param num
   */
  getMenuOrderTemplate(order: MerchantMenuOrderEntity) {
    let content = '';
    content += `<FS><center># ${order.tableName} #</center></FS>`;
    content += Array(32).join('-');
    content += `<center>取餐号：${order.rowNo}号</center>`;
    content += `<center>-- ${this.getRefundType(
      order.payType,
      order.payStatus,
    )} --</center>`;
    content += `就餐人数：${order.people}人\n`;
    content += `下单时间：${moment(order.createdAt)
      .locale('zh-cn')
      .format('YYYY-MM-DD HH:mm:ss')}\n`;
    content += Array(32).join('-');
    content += '名称             单价 数量 金额 \n'; // 16+6+4+6

    let goodsCount = 0;
    //循环拼接打印模板
    for (const goods of order.orderGoodsList) {
      goodsCount += goods.totalNum;

      // 设置名称字符长度
      let goodsName = goods.name;
      const goodsLen = goodsName.length * 2;
      for (let i = goodsLen; i < 16; i++) {
        goodsName += ' ';
      }

      // 设置单价字符长度
      let goodsPrice = String(
        goods.gradeGoodsMoney > 0 ? goods.gradeGoodsMoney : goods.goodsPrice,
      );
      for (let i = goodsPrice.length; i < 6; i++) {
        goodsPrice += ' ';
      }

      // 设置数量字符长度
      let goodsNum = String(goods.totalNum);
      for (let i = goodsNum.length; i < 4; i++) {
        goodsNum += ' ';
      }

      //设置金额字符长度
      let totalPrice = String(
        goods.gradeTotalMoney > 0 ? goods.gradeTotalMoney : goods.totalPrice,
      );
      for (let i = totalPrice.length; i < 6; i++) {
        totalPrice += ' ';
      }
      content += goodsName + goodsPrice + goodsNum + totalPrice + '\n';
    }
    content += Array(32).join('-');
    content += `商品数量：${goodsCount}\n`;
    content += `商品金额：￥${order.totalPrice}元\n`;
    content += `餐具/调料费：￥${order.wareFee}元\n`;
    if (order.pointsMoney) {
      content += `积分抵扣：￥${order.pointsMoney}元\n`;
    }
    content += `实付金额：￥${order.payPrice}元\n`;
    if (order.buyerRemark) {
      content += `顾客留言：${order.buyerRemark}\n`;
    }
    content += Array(32).join('-');
    content += `<FS><center># ${order.tableName} # 完</center></FS>`;
    content += '\n';
    return content;
  }

  /**
   * 发放订单商品赠送的优惠券
   * @param orderId
   */
  async grantOrderGoodsCoupon(
    couponRepo: Repository<MerchantCouponEntity>,
    couponGrantRepo: Repository<MerchantCouponGrantEntity>,
    orderId: number,
    orderGoodsList?: MerchantMenuOrderGoodsEntity[],
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
