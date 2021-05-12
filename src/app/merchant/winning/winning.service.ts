import { BaseService } from '@app/app.service';
import {
  Between,
  FindConditions,
  In,
  InjectService,
  Repository,
  Transaction,
  TransactionRepository,
} from '@jiaxinjiang/nest-orm/dist';
import { Injectable, Inject } from '@nestjs/common';
import {
  MerchantUserEntity,
  MerchantGameWinningEntity,
  MerchantGameWinningGoodsEntity,
  MerchantGameWinningAddressEntity,
  MerchantGameWinningExpressEntity,
  MerchantGameWinningStatusEnum,
  MerchantGoodsPrizeGetMethodsEnum,
  MerchantGoodsSkuEntity,
  MerchantCouponEntity,
  MerchantCouponGrantEntity,
} from '@typeorm/meeluoShop';
import { AdminExpressService } from '@app/admin/express';
import { MerchantUserService } from '../user/user.service';
import { MerchantWechatTemplateService } from '@app/merchant/wechat/template';
import { RegionService } from '@app/common/region/region.service';
import { OrmService } from '@typeorm/orm.service';
import {
  MerchantWinningListParamsDTO,
  MerchantWinningDeliverPrizeDTO,
} from './winning.dto';
import { MerchantGoodsService } from '../goods';
import { MerchantOrderService } from '../order';
import { MerchantGamePrizeSettingService } from '../game/prize/setting';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  MerchantWinningGetDetailException,
  MerchantWinningDeliverPrizeException,
  MerchantWinningReceiptException,
} from './winning.exception';
import { OrderMessageTypeEnum } from '@app/consumer/order/order.dto';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';
import { MerchantCouponService } from '../coupon';

@Injectable()
export class MerchantWinningService extends BaseService {
  constructor(
    @InjectLogger(MerchantWinningService)
    private logger: LoggerProvider,
    @Inject(RegionService)
    private regionService: RegionService,
    @Inject(AdminExpressService)
    private expressService: AdminExpressService,
    @Inject(MerchantUserService)
    private merchantUserService: MerchantUserService,
    @Inject(MerchantGoodsService)
    private merchantGoodsService: MerchantGoodsService,
    @Inject(MerchantOrderService)
    private merchantOrderService: MerchantOrderService,
    @Inject(MerchantCouponService)
    private merchantCouponService: MerchantCouponService,
    @Inject(MerchantGamePrizeSettingService)
    private gamePrizeSettingService: MerchantGamePrizeSettingService,
    @Inject(MerchantWechatTemplateService)
    private wechatTemplateService: MerchantWechatTemplateService,
    @InjectService(MerchantUserEntity)
    private userEntityService: OrmService<MerchantUserEntity>,
    @InjectService(MerchantGameWinningEntity)
    private winningEntityService: OrmService<MerchantGameWinningEntity>,
    @InjectService(MerchantGameWinningGoodsEntity)
    private winningGoodsEntityService: OrmService<
      MerchantGameWinningGoodsEntity
    >,
    @InjectService(MerchantGameWinningExpressEntity)
    private winningExpressEntityService: OrmService<
      MerchantGameWinningExpressEntity
    >,
    @InjectService(MerchantGameWinningAddressEntity)
    private winningAddressEntityService: OrmService<
      MerchantGameWinningAddressEntity
    >,
  ) {
    super();
  }

  /**
   * 获取获奖记录列表
   * @param query
   * @param merchantId
   */
  async list(
    query: MerchantWinningListParamsDTO,
    merchantId: number,
    withUserInfo = true,
  ) {
    const {
      pageSize,
      pageIndex,
      status,
      orderNo,
      startTime,
      endTime,
      userId,
    } = query;
    const condition: FindConditions<MerchantGameWinningEntity> & {
      [key: string]: any;
    } = {
      status,
      merchantId,
      merchantUserId: userId,
      winningNo_contains: orderNo,
    };
    if (startTime) {
      condition.createdAt = Between(startTime, endTime || new Date());
    } else {
      condition.createdAt_lte = endTime;
    }
    const winningResp = await this.winningEntityService.findAndCount({
      relations: ['gameRanking'],
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        ...condition,
      },
      order: {
        id: 'DESC',
      },
    });
    await this.bindWinningGoods(winningResp.rows);
    // 查询微信用户信息
    if (withUserInfo) {
      await this.merchantUserService.bindWechatUser(
        winningResp.rows.map(item => item.gameRanking),
        'wechatUser',
        'openid',
      );
    }
    return winningResp;
  }

  /**
   * 获取获奖记录详情
   * @param id
   * @param identity
   */
  async detail(id: number, merchantId: number, merchantUserId?: number) {
    const winningInfo = await this.winningEntityService.findOne({
      relations: ['gameRanking'],
      where: {
        id,
        merchantId,
        merchantUserId,
      },
    });
    await Promise.all([
      this.bindWinningGoods(winningInfo),
      this.bindWinningAddress(winningInfo, true),
    ]);
    if (
      winningInfo.winningGoods.prizeGetMethods ===
      MerchantGoodsPrizeGetMethodsEnum.DISTRIBUTION
    ) {
      await this.bindWinningExpress(winningInfo.winningGoods);
    }
    // 如果没有指定用户，就顺带查询微信用户信息
    if (!merchantUserId) {
      await this.merchantUserService.bindWechatUser(
        winningInfo.gameRanking,
        'wechatUser',
        'openid',
      );
    }
    return winningInfo;
  }

  /**
   * 给获奖记录绑定收货地址
   * @param entitys
   */
  async bindWinningAddress(
    entitys: MerchantGameWinningEntity,
    withRegionName: boolean,
  ): Promise<MerchantGameWinningEntity>;
  async bindWinningAddress(
    entitys: MerchantGameWinningEntity[],
    withRegionName: boolean,
  ): Promise<MerchantGameWinningEntity[]>;
  async bindWinningAddress(
    entitys: MerchantGameWinningEntity | MerchantGameWinningEntity[],
    withRegionName = false,
  ) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const winningIds = Array.from(new Set(targets.map(item => item.id)));
    const addressList = await this.winningAddressEntityService.find({
      where: { winningId: In(winningIds.length ? winningIds : [null]) },
    });
    const regionCodes: number[] = [];
    targets.forEach(target => {
      target.winningAddress =
        addressList.find(item => item.winningId === target.id) || null;
      if (withRegionName && target.winningAddress) {
        const { provinceCode, countyCode, cityCode } = target.winningAddress;
        regionCodes.push(provinceCode, cityCode, countyCode);
      }
    });
    if (regionCodes.length) {
      // 获取省份、城市、乡镇名称
      const regionData = this.regionService.getRegionNameByCodes(regionCodes);
      targets.forEach(target => {
        if (!target.winningAddress) {
          return;
        }
        const { provinceCode, countyCode, cityCode } = target.winningAddress;
        target.winningAddress.provinceName = regionData[provinceCode];
        target.winningAddress.cityName = regionData[cityCode];
        target.winningAddress.countyName = regionData[countyCode];
      });
    }
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 给获奖记录绑定奖品信息
   * @param entitys
   */
  async bindWinningGoods(
    entitys: MerchantGameWinningEntity,
  ): Promise<MerchantGameWinningEntity>;
  async bindWinningGoods(
    entitys: MerchantGameWinningEntity[],
  ): Promise<MerchantGameWinningEntity[]>;
  async bindWinningGoods(
    entitys: MerchantGameWinningEntity | MerchantGameWinningEntity[],
  ) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const winningIds = Array.from(new Set(targets.map(item => item.id)));
    const winningGoods = await this.winningGoodsEntityService.find({
      where: { winningId: In(winningIds.length ? winningIds : [null]) },
    });
    targets.forEach(target => {
      target.winningGoods =
        winningGoods.find(item => item.winningId === target.id) || null;
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 给获奖记录绑定发货信息
   * @param entitys
   */
  async bindWinningExpress(
    entitys: MerchantGameWinningGoodsEntity,
  ): Promise<MerchantGameWinningGoodsEntity>;
  async bindWinningExpress(
    entitys: MerchantGameWinningGoodsEntity[],
  ): Promise<MerchantGameWinningGoodsEntity[]>;
  async bindWinningExpress(
    entitys: MerchantGameWinningGoodsEntity | MerchantGameWinningGoodsEntity[],
  ) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const winningGoodsIds = Array.from(new Set(targets.map(item => item.id)));
    const winningExpress = await this.winningExpressEntityService.find({
      where: {
        winningGoodsId: In(winningGoodsIds.length ? winningGoodsIds : [null]),
      },
    });
    targets.forEach(target => {
      target.winningExpress =
        winningExpress.find(item => item.winningGoodsId === target.id) || null;
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 把未领奖和未确认的订单设置为已过期
   * @param winningId
   * @param userId
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async winningExpire(
    winningId: number,
    userId: number,
    merchantId: number,
    @TransactionRepository(MerchantGameWinningEntity)
    winningRepo?: Repository<MerchantGameWinningEntity>,
    @TransactionRepository(MerchantGameWinningGoodsEntity)
    winningGoodsRepo?: Repository<MerchantGameWinningGoodsEntity>,
    @TransactionRepository(MerchantGoodsSkuEntity)
    goodsSkuRepo?: Repository<MerchantGoodsSkuEntity>,
  ) {
    const winningEntityService = this.getService(winningRepo);
    const winningGoodsEntityService = this.getService(winningGoodsRepo);
    const winning = await winningEntityService.findById(winningId);
    // 检查获奖订单状态，如果状态不是未确认状态，则跳过
    if (winning.status !== MerchantGameWinningStatusEnum.NO_RECEIVED) {
      return false;
    }
    // 修改订单状态
    await winningEntityService.updateById(
      {
        status: MerchantGameWinningStatusEnum.EXPIRED,
      },
      winningId,
      userId,
    );
    // 查询获奖商品
    const winningGoods = await winningGoodsEntityService.findOne({
      select: ['id', 'goodsId', 'specSkuId'],
      where: {
        winningId,
      },
    });
    if (!winningGoods) {
      return false;
    }
    // 还原商品库存
    await goodsSkuRepo.increment(
      { goodsId: winningGoods.goodsId, specSkuId: winningGoods.specSkuId },
      'stock',
      1,
    );
    // 清除商品redis缓存
    await this.merchantGoodsService.clearDetailCache(
      winningGoods.goodsId,
      merchantId,
    );
    return true;
  }

  @Transaction(MEELUO_SHOP_DATABASE)
  async deliverPrize(
    {
      winningId,
      staffId,
      expressId,
      expressNo,
    }: MerchantWinningDeliverPrizeDTO,
    userId: number,
    merchantId: number,
    @TransactionRepository(MerchantGameWinningEntity)
    winningRepo?: Repository<MerchantGameWinningEntity>,
    @TransactionRepository(MerchantGameWinningExpressEntity)
    winningExpressRepo?: Repository<MerchantGameWinningExpressEntity>,
    @TransactionRepository(MerchantCouponEntity)
    couponRepo?: Repository<MerchantCouponEntity>,
    @TransactionRepository(MerchantCouponGrantEntity)
    couponGrantRepo?: Repository<MerchantCouponGrantEntity>,
  ) {
    const winningEntityService = this.getService(winningRepo);
    const winningExpressEntityService = this.getService(winningExpressRepo);
    const winning = await winningEntityService.findOne({
      where: {
        id: winningId,
        merchantId,
      },
    });
    await this.bindWinningGoods(winning);
    if (!winning || !winning.winningGoods?.id) {
      throw new MerchantWinningGetDetailException({ msg: '错误的获奖订单id' });
    }
    if (
      winning.status !== MerchantGameWinningStatusEnum.NO_DELIVERED &&
      winning.status !== MerchantGameWinningStatusEnum.NO_RECEIVED
    ) {
      throw new MerchantWinningGetDetailException({
        msg: '错误的获奖订单状态',
      });
    }
    // 奖品邮寄发货
    if (
      winning.winningGoods.prizeGetMethods ===
      MerchantGoodsPrizeGetMethodsEnum.DISTRIBUTION
    ) {
      if (!expressId) {
        throw new MerchantWinningDeliverPrizeException({
          msg: '物流公司不能为空',
        });
      }
      if (!expressNo) {
        throw new MerchantWinningDeliverPrizeException({
          msg: '物流单号不能为空',
        });
      }
      const express = await this.expressService.detail(expressId);
      if (!express) {
        throw new MerchantWinningDeliverPrizeException({
          msg: '错误的物流公司id',
        });
      }
      // 更新获奖订单发货人员
      await winningEntityService.updateById(
        {
          status: MerchantGameWinningStatusEnum.DELIVERED,
          extractClerkId: staffId,
        },
        winningId,
        userId,
      );
      // 增加商品订单物流信息
      await winningExpressEntityService.create(
        {
          winningId,
          winningGoodsId: winning.winningGoods.id,
          expressNo,
          expressId,
          expressCompany: express.name,
          expressCode: express.code,
          merchantId,
          merchantUserId: winning.merchantUserId,
        },
        userId,
      );
      const prizeSetting = await this.gamePrizeSettingService.getGamePrizeSetting(
        merchantId,
      );
      if (prizeSetting.deliveredAutoSureDay > 0) {
        // 给已发货订单增加定时任务，超过配置时间，自动确认收货
        await this.merchantOrderService.pushOrderDelayTask(
          OrderMessageTypeEnum.AUTO_RECEIPT_WINNING,
          {
            orderId: winningId,
            merchantId,
            userId: winning.merchantUserId,
          },
          prizeSetting.deliveredAutoSureDay * 24 * 3600 * 1000,
        );
      }
      // 给用户发送发货通知
      await this.sendDeliveryMessage({
        winningId,
        deliveryType: winning.winningGoods.prizeGetMethods,
        userId: winning.merchantUserId,
        merchantId,
        expressNo,
        expressCompany: express.name,
        winningNo: winning.winningNo,
        goodsName: winning.winningGoods.name,
      }).catch(err => this.logger.error(err));
    } else {
      // 上门自提，发货后直接确认收货
      // 更新获奖订单发货人员，
      await winningEntityService.updateById(
        {
          status: MerchantGameWinningStatusEnum.RECEIVED,
          extractClerkId: staffId,
        },
        winningId,
        userId,
      );
      // 发放奖品绑定的优惠券
      if (winning?.winningGoods?.giftCouponId) {
        await this.merchantCouponService.grant(
          {
            merchantUserId: winning.merchantUserId,
            couponId: winning.winningGoods.giftCouponId,
            merchantId,
          },
          couponRepo,
          couponGrantRepo,
        );
      }
      // 给用户发送发货通知
      await this.sendDeliveryMessage({
        winningId,
        deliveryType: winning.winningGoods.prizeGetMethods,
        userId: winning.merchantUserId,
        merchantId,
        expressNo: '无',
        expressCompany: '无',
        winningNo: winning.winningNo,
        goodsName: winning.winningGoods.name,
      }).catch(err => this.logger.error(err));
    }
    return true;
  }

  /**
   * 给用户发送发货通知
   * @param params
   */
  async sendDeliveryMessage(params: {
    winningNo: string;
    userId: number;
    expressCompany: string;
    expressNo: string;
    merchantId: number;
    goodsName: string;
    winningId: number;
    deliveryType: MerchantGoodsPrizeGetMethodsEnum;
  }) {
    const {
      userId,
      winningNo,
      winningId,
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
    if (deliveryType === MerchantGoodsPrizeGetMethodsEnum.DISTRIBUTION) {
      const winningAddress = await this.winningAddressEntityService.findOne({
        where: {
          winningId,
        },
      });
      this.bindWinningAddressName(winningAddress);
      address = `${winningAddress?.name} ${winningAddress?.phone} ${winningAddress?.provinceName} ${winningAddress?.cityName} ${winningAddress?.countyName} ${winningAddress?.address}`;
    } else {
      address = `到店自提`;
    }
    return this.wechatTemplateService.sendWinningDeliveryNotice(
      {
        winningId,
        openid: userinfo.openid,
        winningNo,
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
   * 获取地区名称
   * @param orderAddress
   */
  bindWinningAddressName(winningAddress: MerchantGameWinningAddressEntity) {
    if (!winningAddress) {
      return null;
    }
    const regionCodes: number[] = [
      winningAddress.provinceCode,
      winningAddress.cityCode,
      winningAddress.countyCode,
    ];
    // 获取省份、城市、乡镇名称
    const regionData = this.regionService.getRegionNameByCodes(regionCodes);
    winningAddress.provinceName = regionData[winningAddress.provinceCode];
    winningAddress.cityName = regionData[winningAddress.cityCode];
    winningAddress.countyName = regionData[winningAddress.countyCode];
    return winningAddress;
  }

  /**
   * 奖品确认收货
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async confirmReceipt(
    id: number,
    merchantId?: number,
    merchantUserId?: number,
    @TransactionRepository(MerchantGameWinningEntity)
    winningRepo?: Repository<MerchantGameWinningEntity>,
    @TransactionRepository(MerchantCouponEntity)
    couponRepo?: Repository<MerchantCouponEntity>,
    @TransactionRepository(MerchantCouponGrantEntity)
    couponGrantRepo?: Repository<MerchantCouponGrantEntity>,
  ) {
    const winningEntityService = this.getService(winningRepo);
    const condition: FindConditions<MerchantGameWinningEntity> = {
      id,
      merchantId,
      merchantUserId,
    };
    const winning = await winningEntityService.findOne({
      select: ['status', 'merchantUserId'],
      where: { ...condition },
    });
    if (winning.status !== MerchantGameWinningStatusEnum.DELIVERED) {
      throw new MerchantWinningReceiptException({ msg: '错误的订单状态' });
    }
    await winningEntityService.updateOne(
      {
        status: MerchantGameWinningStatusEnum.RECEIVED,
      },
      {
        ...condition,
      },
      winning.merchantUserId,
    );
    await this.bindWinningGoods(winning);
    // 发放奖品绑定的优惠券
    if (winning?.winningGoods?.giftCouponId) {
      await this.merchantCouponService.grant(
        {
          merchantUserId: winning.merchantUserId,
          couponId: winning.winningGoods.giftCouponId,
          merchantId,
        },
        couponRepo,
        couponGrantRepo,
      );
    }
    return true;
  }
}
