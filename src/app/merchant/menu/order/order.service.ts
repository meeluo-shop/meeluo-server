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
    orderInfo.orderGoodsList = await this.orderGoodsEntityService.find({
      where: {
        orderId: orderInfo.id,
      },
    });

    // ????????????????????????
    await this.merchantUserService.bindMerchantUser(
      orderInfo,
      'merchantUser',
      'merchantUserId',
    );
    return orderInfo;
  }

  /**
   * ????????????????????????
   * @param goodsList
   */
  validateGoodsStockNum(goodsList: MerchantMenuOrderGoodsInfo[]) {
    for (const goods of goodsList) {
      if (goods.goodsNum > goods.skus[0].stock) {
        throw new MerchantMenuOrderLackOfStockException({
          msg: `?????????????????? ???${goods.name}??? ????????????`,
        });
      }
    }
  }

  /**
   * ???????????????????????????
   * @param goodsList
   * @param userId
   * @param merchantId
   */
  async setOrderGoodsGradeMoney(
    goodsList: MerchantMenuOrderGoodsInfo[],
    userinfo: MerchantUserEntity,
  ) {
    // ????????????????????????
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
   * ???????????????????????????????????????
   */
  setOrderGoodsPayPrice(goodsList: MerchantMenuOrderGoodsInfo[]) {
    let orderGoodsPrice = 0;
    let goodsTotalPrice = 0;
    // ???????????? - ????????????
    for (const goods of goodsList) {
      // ????????????????????????????????????
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
   * ??????????????????
   * @param merchantId
   * @param baseNum
   * @returns
   */
  async generateRowNo(merchantId: number, baseNum = 100) {
    const surplusTime = DateHelperProvider.getTodaySurplus();
    // ????????????????????????+1
    const count = await this.cacheProvider.incr(
      `${MERCHANT_RESTAURANT_NO_PREFIX}:${merchantId}`,
      surplusTime,
    );
    return count + baseNum;
  }

  /**
   * ????????????????????????
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
      // ??????????????????????????????
      orderSetting = await this.merchantMenuSettingService.getOrderSetting(
        merchantId,
      );
    }
    if (orderSetting.finishedAutoSureHour > 0) {
      // ??????????????????????????????????????????????????????????????????????????????
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
    // ????????????
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
      // ??????????????????
      await this.setOrderGoodsGradeMoney(goodsList, userinfo);
    }
    // ???????????????????????????????????????
    for (const goods of goodsList) {
      goods.totalPrice = MathHelperProvider.multiply(
        goods.gradeGoodsPrice || goods.skus[0].price,
        goods.goodsNum,
      );
    }
    // ??????????????????????????????
    const orderSetting = await this.merchantMenuSettingService.getOrderSetting(
      merchantId,
    );
    // ???????????????????????????????????????
    const { orderGoodsPrice, goodsTotalPrice } = this.setOrderGoodsPayPrice(
      goodsList,
    );
    // ????????????/?????????
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
    // ??????????????????
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
      staffId,
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
    if (
      payType === MerchantMenuPayTypeEnum.BALANCE &&
      userinfo?.id &&
      order.payPrice > 0
    ) {
      // ??????????????????
      await this.merchantUserService.modifyUserBalance(
        userinfo?.id,
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
    const goodsSalesList: Array<{ id: number; total: number }> = [];
    order.orderGoodsList.forEach(goods => {
      const item = goodsSalesList.find(val => val.id === goods.goodsId);
      if (item) {
        item.total = MathHelperProvider.add(item.total, goods.totalNum);
      } else {
        goodsSalesList.push({ id: goods.goodsId, total: goods.totalNum });
      }
    });
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
    // ?????????????????????????????????
    await this.sendSubmitMenuNotify({
      merchantId,
      order,
      orderGoodsList: order.orderGoodsList,
    }).catch(err => this.logger.error(err));
    // ??????????????????
    await this.printOrder(order.id, merchantId, order);
    // ???????????????????????????????????????????????????????????????
    await this.delayAutoCompleteOrder({
      orderId: order.id,
      userId: staffId,
      merchantId,
      orderSetting,
    });
    // ????????????????????????
    await Promise.all(
      Array.from(new Set(goodsList.map(val => val.id))).map(id =>
        this.merchantGoodsService.clearDetailCache(id, merchantId),
      ),
    );
    delete order.orderGoodsList;
    return order;
  }

  /**
   * ???????????????????????????
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
        `${goods.name}${goods.specs ? `???${goods.specs}???` : ''}??? ${
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
        menus: goodsNames.join('???'),
      },
      merchantId,
    );
  }

  /**
   * ??????????????????????????????
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
      // ??????????????????
      this.goodsEntityService.find({
        where: {
          id: In(goodsIds.length ? goodsIds : [null]),
          merchantId,
        },
      }),
      // ????????????????????????
      this.goodsSkuEntityService.find({
        where: {
          goodsId: In(goodsIds.length ? goodsIds : [null]),
          specSkuId: In(skuIds.length ? skuIds : [null]),
        },
      }),
    ]);
    await Promise.all([
      // ??????????????????????????????
      this.merchantGoodsSpecService.bindGoodsSpecList(goodsList),
      // ???????????????????????????
      this.resourceService.bindTargetResource(
        goodsList,
        'thumbnail',
        'thumbnailId',
      ),
    ]);
    // ???????????????????????????
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
          goodsRecord.specs += `${mapping.spec.name}???${mapping.specValue.value}???`;
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
      // ???????????????????????????????????????
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
   * ??????????????????????????????????????????
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
      throw new MerchantMenuOrderGetDetailException({ msg: '???????????????id' });
    }
    if (
      order.payStatus === MerchantMenuOrderPayStatusEnum.NOT_PAID ||
      order.orderStatus !== MerchantMenuOrderStatusEnum.IN_PROCESS
    ) {
      throw new MerchantMenuOrderGetDetailException({ msg: '?????????????????????' });
    }
    return order;
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
        msg: '?????????????????????id',
      });
    }
    if (orderGoods.extractClerkId) {
      throw new MerchantMenuOrderGetDetailException({
        msg: '??????????????????????????????????????????',
      });
    }
    return order;
  }

  /**
   * ????????????????????????????????????
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
      throw new MerchantMenuOrderGetDetailException({ msg: '???????????????id' });
    }
    // ?????????????????????????????????
    if (
      order.orderStatus !== MerchantMenuOrderStatusEnum.IN_PROCESS &&
      order.payStatus !== MerchantMenuOrderPayStatusEnum.OFFLINE_PAY
    ) {
      throw new MerchantMenuOrderGetDetailException({ msg: '?????????????????????' });
    }
    if (order.payStatus === MerchantMenuOrderPayStatusEnum.PAID) {
      throw new MerchantMenuOrderIsPaidException();
    }
    // ??????????????????????????????
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
   * ??????????????????
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
    // ??????????????????????????????????????????
    const isFinish = order.orderGoodsList.every(item => !!item.extractClerkId);
    // ????????????????????????????????????????????????????????????????????????
    if (isFinish && order.payStatus === MerchantMenuOrderPayStatusEnum.PAID) {
      // ?????????????????????????????????????????????
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
      }
    } else if (isFinish) {
      // ??????????????????????????????????????????????????????????????????
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
   * ????????????????????????
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
    // ?????????????????????????????????
    await orderGoodsEntityService.update(
      {
        extractClerkId: userId,
      },
      { orderId: id },
      userId,
    );
    // ??????????????????
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
      await this.grantOrderGoodsCoupon(couponRepo, couponGrantRepo, order.id);
    }
    return true;
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
      throw new MerchantMenuOrderGetDetailException({ msg: '???????????????id' });
    }
    if (
      order.orderStatus !== MerchantMenuOrderStatusEnum.WAIT_CANCEL ||
      order.payStatus !== MerchantMenuOrderPayStatusEnum.PAID
    ) {
      throw new MerchantMenuOrderAgreeCancelException({
        msg: '?????????????????????',
      });
    }
    if (
      order.deliveryStatus === MerchantMenuOrderDeliveryStatusEnum.DELIVERED
    ) {
      throw new MerchantMenuOrderAgreeCancelException({
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
        orderStatus: MerchantMenuOrderStatusEnum.CANCEL,
      },
      order.id,
      userId,
    );
    let refundType: MerchantMenuOrderPayTypeEnum;
    // ????????????????????????
    const cert = await this.wechatService.getPaymentCert(merchantId);
    if (order.payType === MerchantMenuOrderPayTypeEnum.WECHAT && cert) {
      // ?????????????????????????????????????????????????????????????????????????????????????????????
      refundType = MerchantMenuOrderPayTypeEnum.WECHAT;
      await this.wechatPayRefund(order, cert, merchantId);
    } else {
      // ??????????????????????????????????????????????????????????????????????????????????????????????????????
      refundType = MerchantMenuOrderPayTypeEnum.BALANCE;
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
   * ????????????????????????????????????
   * @param orderId
   * @param param1
   * @param updatePrice
   */
  async refuseCancelOrder(orderId: number, userId: number, merchantId: number) {
    const order = await this.orderEntityService.findOne({
      where: { id: orderId, merchantId },
    });
    if (!order) {
      throw new MerchantMenuOrderGetDetailException({ msg: '???????????????id' });
    }
    if (order.orderStatus !== MerchantMenuOrderStatusEnum.WAIT_CANCEL) {
      throw new MerchantMenuOrderRefuseCancelException({
        msg: '?????????????????????',
      });
    }
    // ??????????????????
    await this.orderEntityService.updateById(
      {
        orderStatus: MerchantMenuOrderStatusEnum.IN_PROCESS,
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
   * ??????????????????
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
      throw new MerchantMenuOrderGetDetailException({ msg: '???????????????id' });
    }
    if (
      order.payStatus === MerchantMenuOrderPayStatusEnum.PAID ||
      order.orderStatus !== MerchantMenuOrderStatusEnum.IN_PROCESS
    ) {
      throw new MerchantMenuOrderGetDetailException({ msg: '?????????????????????' });
    }
    await this.orderEntityService.updateById(
      {
        orderNo: UtilHelperProvider.generateOrderNo(), // ???????????????, ??????????????????????????????
        updatePrice: price,
        payPrice: MathHelperProvider.add(price, order.wareFee),
      },
      orderId,
      userId,
    );
    return true;
  }

  /**
   * ??????????????????
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
      totalFee: fee, // ?????????????????????????????????
      refundFee: fee, // ?????????????????????????????????
      outRefundNo: order.orderNo,
    });
  }

  /**
   * ??????????????????
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
    // ????????????redis??????
    await Promise.all(
      orderGoodsList.map(order =>
        this.merchantGoodsService.clearDetailCache(order.goodsId, merchantId),
      ),
    );
    return true;
  }

  /**
   * ??????????????????
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
   * ??????????????????
   * @param payType
   * @param payStatus
   * @returns
   */
  getRefundType(
    payType: MerchantMenuOrderPayTypeEnum,
    payStatus: MerchantMenuOrderPayStatusEnum,
  ) {
    if (payStatus === MerchantMenuOrderPayStatusEnum.OFFLINE_PAY) {
      return '????????????';
    }
    if (payStatus === MerchantMenuOrderPayStatusEnum.NOT_PAID) {
      return '?????????';
    }
    switch (payType) {
      case MerchantMenuOrderPayTypeEnum.BALANCE:
        return '????????????';
      case MerchantMenuOrderPayTypeEnum.WECHAT:
        return '????????????';
      default:
        return '????????????';
    }
  }

  /**
   * ????????????????????????????????????
   * @param data
   * @param num
   */
  getMenuOrderTemplate(order: MerchantMenuOrderEntity) {
    let content = '';
    content += `<FS><center># ${order.tableName} #</center></FS>`;
    content += Array(32).join('-');
    content += `<center>????????????${order.rowNo}???</center>`;
    content += `<center>-- ${this.getRefundType(
      order.payType,
      order.payStatus,
    )} --</center>`;
    content += `???????????????${order.people}???\n`;
    content += `???????????????${moment(order.createdAt)
      .locale('zh-cn')
      .format('YYYY-MM-DD HH:mm:ss')}\n`;
    content += Array(32).join('-');
    content += '??????             ?????? ?????? ?????? \n'; // 16+6+4+6

    let goodsCount = 0;
    //????????????????????????
    for (const goods of order.orderGoodsList) {
      goodsCount += goods.totalNum;

      // ????????????????????????
      let goodsName = goods.name;
      const goodsLen = goodsName.length * 2;
      for (let i = goodsLen; i < 16; i++) {
        goodsName += ' ';
      }

      // ????????????????????????
      let goodsPrice = String(
        goods.gradeGoodsMoney > 0 ? goods.gradeGoodsMoney : goods.goodsPrice,
      );
      for (let i = goodsPrice.length; i < 6; i++) {
        goodsPrice += ' ';
      }

      // ????????????????????????
      let goodsNum = String(goods.totalNum);
      for (let i = goodsNum.length; i < 4; i++) {
        goodsNum += ' ';
      }

      //????????????????????????
      let totalPrice = String(
        goods.gradeTotalMoney > 0 ? goods.gradeTotalMoney : goods.totalPrice,
      );
      for (let i = totalPrice.length; i < 6; i++) {
        totalPrice += ' ';
      }
      content += goodsName + goodsPrice + goodsNum + totalPrice + '\n';
    }
    content += Array(32).join('-');
    content += `???????????????${goodsCount}\n`;
    content += `??????????????????${order.totalPrice}???\n`;
    content += `??????/???????????????${order.wareFee}???\n`;
    if (order.pointsMoney) {
      content += `??????????????????${order.pointsMoney}???\n`;
    }
    content += `??????????????????${order.payPrice}???\n`;
    if (order.buyerRemark) {
      content += `???????????????${order.buyerRemark}\n`;
    }
    content += Array(32).join('-');
    content += `<FS><center># ${order.tableName} # ???</center></FS>`;
    content += '\n';
    return content;
  }

  /**
   * ????????????????????????????????????
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
