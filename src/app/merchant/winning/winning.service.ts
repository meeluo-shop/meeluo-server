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
   * ????????????????????????
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
    // ????????????????????????
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
   * ????????????????????????
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
    // ????????????????????????????????????????????????????????????
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
   * ?????????????????????????????????
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
      // ????????????????????????????????????
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
   * ?????????????????????????????????
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
   * ?????????????????????????????????
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
   * ???????????????????????????????????????????????????
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
    // ????????????????????????????????????????????????????????????????????????
    if (winning.status !== MerchantGameWinningStatusEnum.NO_RECEIVED) {
      return false;
    }
    // ??????????????????
    await winningEntityService.updateById(
      {
        status: MerchantGameWinningStatusEnum.EXPIRED,
      },
      winningId,
      userId,
    );
    // ??????????????????
    const winningGoods = await winningGoodsEntityService.findOne({
      select: ['id', 'goodsId', 'specSkuId'],
      where: {
        winningId,
      },
    });
    if (!winningGoods) {
      return false;
    }
    // ??????????????????
    await goodsSkuRepo.increment(
      { goodsId: winningGoods.goodsId, specSkuId: winningGoods.specSkuId },
      'stock',
      1,
    );
    // ????????????redis??????
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
      throw new MerchantWinningGetDetailException({ msg: '?????????????????????id' });
    }
    if (
      winning.status !== MerchantGameWinningStatusEnum.NO_DELIVERED &&
      winning.status !== MerchantGameWinningStatusEnum.NO_RECEIVED
    ) {
      throw new MerchantWinningGetDetailException({
        msg: '???????????????????????????',
      });
    }
    // ??????????????????
    if (
      winning.winningGoods.prizeGetMethods ===
      MerchantGoodsPrizeGetMethodsEnum.DISTRIBUTION
    ) {
      if (!expressId) {
        throw new MerchantWinningDeliverPrizeException({
          msg: '????????????????????????',
        });
      }
      if (!expressNo) {
        throw new MerchantWinningDeliverPrizeException({
          msg: '????????????????????????',
        });
      }
      const express = await this.expressService.detail(expressId);
      if (!express) {
        throw new MerchantWinningDeliverPrizeException({
          msg: '?????????????????????id',
        });
      }
      // ??????????????????????????????
      await winningEntityService.updateById(
        {
          status: MerchantGameWinningStatusEnum.DELIVERED,
          extractClerkId: staffId,
        },
        winningId,
        userId,
      );
      // ??????????????????????????????
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
        // ??????????????????????????????????????????????????????????????????????????????
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
      // ???????????????????????????
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
      // ??????????????????????????????????????????
      // ?????????????????????????????????
      await winningEntityService.updateById(
        {
          status: MerchantGameWinningStatusEnum.RECEIVED,
          extractClerkId: staffId,
        },
        winningId,
        userId,
      );
      // ??????????????????????????????
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
      // ???????????????????????????
      await this.sendDeliveryMessage({
        winningId,
        deliveryType: winning.winningGoods.prizeGetMethods,
        userId: winning.merchantUserId,
        merchantId,
        expressNo: '???',
        expressCompany: '???',
        winningNo: winning.winningNo,
        goodsName: winning.winningGoods.name,
      }).catch(err => this.logger.error(err));
    }
    return true;
  }

  /**
   * ???????????????????????????
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
      address = `????????????`;
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
   * ??????????????????
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
    // ????????????????????????????????????
    const regionData = this.regionService.getRegionNameByCodes(regionCodes);
    winningAddress.provinceName = regionData[winningAddress.provinceCode];
    winningAddress.cityName = regionData[winningAddress.cityCode];
    winningAddress.countyName = regionData[winningAddress.countyCode];
    return winningAddress;
  }

  /**
   * ??????????????????
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
      throw new MerchantWinningReceiptException({ msg: '?????????????????????' });
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
    // ??????????????????????????????
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
