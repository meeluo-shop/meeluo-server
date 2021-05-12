import * as QS from 'querystring';
import { FastifyRequest } from 'fastify';
import { CacheProvider } from '@jiaxinjiang/nest-redis';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';
import {
  AllowAutoMatchSetMealEnum,
  AllowCustomAmountEnum,
  MerchantRechargePlanService,
  MerchantRechargeSettingService,
} from '@app/merchant/recharge';
import {
  InjectService,
  Repository,
  Transaction,
  TransactionRepository,
} from '@jiaxinjiang/nest-orm';
import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENT_USER_WECHAT_TRADE_NO,
  MEELUO_SHOP_DATABASE,
} from '@core/constant';
import {
  MerchantEntity,
  MerchantOrderPayTypeEnum,
  MerchantRechargePlanEntity,
  MerchantUserBalanceLogEntity,
  MerchantUserBalanceLogSceneEnum,
  MerchantUserBalanceModifyTypeEnum,
  MerchantUserEntity,
  WechatPaymentOrderEntity,
  WechatPaymentOrderIsSubscribeEnum,
  WechatPaymentOrderSceneEnum,
  WechatPaymentOrderTradeStateEnum,
  WechatPaymentOrderTradeTypeEnum,
} from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { MerchantUserService } from '@app/merchant/user';
import {
  ClientRechargeParamsDTO,
  ClientRechargeWechatPaySignData,
} from './recharge.dto';
import {
  ClientRechargeNoPlanIdException,
  ClientRechargeInvalidAmountException,
  ClientRechargeWechatPayFailedException,
} from './recharge.exception';
import {
  UtilHelperProvider,
  CryptoHelperProvider,
  MathHelperProvider,
} from '@shared/helper';
import { ClientRechargeBalanceLogListDTO } from './recharge.dto';
import Payment from '@library/easyWechat/Payment/Application';
import { BaseService } from '@app/app.service';
import { MerchantWechatService } from '@app/merchant/wechat';

@Injectable()
export class ClientRechargeService extends BaseService {
  constructor(
    @InjectLogger(ClientRechargeService)
    private logger: LoggerProvider,
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @Inject(MerchantWechatService)
    private merchamtWechatService: MerchantWechatService,
    @Inject(MerchantUserService)
    private merchantUserService: MerchantUserService,
    @Inject(MerchantRechargePlanService)
    private merchantPlanService: MerchantRechargePlanService,
    @Inject(MerchantRechargeSettingService)
    private merchantRechargeSettingService: MerchantRechargeSettingService,
    @InjectService(MerchantEntity)
    private merchantEntityService: OrmService<MerchantEntity>,
    @InjectService(MerchantUserBalanceLogEntity)
    private balanceLogEntityService: OrmService<MerchantUserBalanceLogEntity>,
  ) {
    super();
  }

  /**
   * 获取用户账户余额记录
   */
  async getBalanceLog(
    { pageSize, pageIndex, type, scene }: ClientRechargeBalanceLogListDTO,
    { userId, merchantId }: ClientIdentity,
  ) {
    return this.balanceLogEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        merchantUserId: userId,
        merchantId,
        scene,
        type,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  /**
   * 获取充值套餐列表
   */
  async getPlanList({ merchantId }: ClientIdentity) {
    return this.merchantPlanService.getRechargePlanList(
      { pageIndex: 1, pageSize: 100 },
      merchantId,
    );
  }

  /**
   * 获取商户充值设置
   */
  async getRechargeSetting({ merchantId }: ClientIdentity) {
    return this.merchantRechargeSettingService.getRechargeSetting(merchantId);
  }

  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async wechatPaySuccess(
    identity: ClientIdentity,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserBalanceLogEntity)
    userBalanceLogRepo?: Repository<MerchantUserBalanceLogEntity>,
  ) {
    let attach: any = {};
    const { merchantId, userId } = identity;
    const wechatPayOrder = await this.queryWechatPayOrder({
      identity,
      repeat: 3,
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
    await this.merchantUserService.modifyUserBalance(
      userId,
      merchantId,
      attach.giftAmount || 0,
      MerchantUserBalanceModifyTypeEnum.ADD,
      MerchantUserBalanceLogSceneEnum.USER_RECHARGE_GIFT,
      MerchantOrderPayTypeEnum.WECHAT,
      `充值套餐赠送：${wechatPayOrder.outTradeNo}`,
      null,
      {
        userRepo,
        userBalanceLogRepo,
      },
    );
    return true;
  }

  /**
   * 查询微信支付订单状态
   * @param transactionId
   */
  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async queryWechatPayOrder(
    {
      repeat = 0,
      paymentAccount,
      identity,
      outTradeNo,
      isConsume = false,
      consumeDesc = '用户消费',
    }: {
      identity: ClientIdentity;
      paymentAccount?: Payment;
      repeat?: number;
      outTradeNo?: string;
      isConsume?: boolean;
      consumeDesc?: string;
    },
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserBalanceLogEntity)
    userBalanceLogRepo?: Repository<MerchantUserBalanceLogEntity>,
    @TransactionRepository(WechatPaymentOrderEntity)
    payOrderRepo?: Repository<WechatPaymentOrderEntity>,
  ) {
    const { openid, userId, merchantId } = identity;
    if (!outTradeNo) {
      outTradeNo = await this.getUserPayTradeNo(openid);
    }
    if (!outTradeNo) {
      throw new Error('当前支付订单异常，请联系客服人员');
    }
    const payOrderEntityService = this.getService(payOrderRepo);
    const merchant = await this.merchantEntityService.findById(merchantId, {
      select: ['allowPrivateWechat', 'agentId'],
    });
    const [officialAccountConfig, paymentConfig] = await Promise.all([
      this.merchamtWechatService.getOfficialAccountConfig(merchantId, merchant),
      this.merchamtWechatService.getPaymentConfig(merchantId, merchant),
    ]);
    if (!paymentAccount) {
      paymentAccount = await this.merchamtWechatService.getPayment({
        merchantId,
        paymentConfig,
        appId: officialAccountConfig.appId,
      });
    }
    const queryOrderResp = await paymentAccount.order.query({ outTradeNo }, 3);
    if (
      queryOrderResp.returnCode !== 'SUCCESS' ||
      queryOrderResp.resultCode !== 'SUCCESS'
    ) {
      throw new Error('查询微信支付订单状态失败，请重新支付或联系客服人员');
    }
    // 判断是未支付，再延迟查询一次
    if (queryOrderResp.tradeState === 'NOTPAY' && repeat > 1) {
      return new Promise<WechatPaymentOrderEntity>((resolve, reject) => {
        setTimeout(async () => {
          this.queryWechatPayOrder({
            identity,
            paymentAccount,
            repeat: repeat - 1,
          })
            .then(resp => resolve(resp))
            .catch(err => reject(err));
        }, 300);
      });
    }
    if (!queryOrderResp.transactionId) {
      return null;
    }
    let attach: any = {};
    if (queryOrderResp.attach) {
      attach = QS.parse(queryOrderResp.attach) || {};
    }
    try {
      await this.delUserPayTradeNo(openid);
      const totalFee = MathHelperProvider.divide(queryOrderResp.totalFee, 100);
      await this.merchantUserService.modifyUserBalance(
        userId,
        merchantId,
        totalFee,
        MerchantUserBalanceModifyTypeEnum.ADD,
        MerchantUserBalanceLogSceneEnum.USER_RECHARGE,
        MerchantOrderPayTypeEnum.WECHAT,
        '微信支付充值',
        null,
        {
          userRepo,
          userBalanceLogRepo,
        },
      );
      if (isConsume) {
        await this.merchantUserService.modifyUserBalance(
          userId,
          merchantId,
          totalFee,
          MerchantUserBalanceModifyTypeEnum.SUBTRACT,
          MerchantUserBalanceLogSceneEnum.USER_CONSUME,
          MerchantOrderPayTypeEnum.WECHAT,
          consumeDesc,
          null,
          {
            userRepo,
            userBalanceLogRepo,
          },
        );
      }
      return payOrderEntityService.upsert(
        {
          appid: queryOrderResp.appid,
          mchId: queryOrderResp.mchId,
          nonceStr: queryOrderResp.nonceStr,
          sign: queryOrderResp.sign,
          openid: queryOrderResp.openid,
          deviceInfo: queryOrderResp.deviceInfo,
          isSubscribe:
            queryOrderResp.isSubscribe === 'Y'
              ? WechatPaymentOrderIsSubscribeEnum.TRUE
              : WechatPaymentOrderIsSubscribeEnum.FALSE,
          tradeType: queryOrderResp.tradeType as WechatPaymentOrderTradeTypeEnum,
          tradeState: queryOrderResp.tradeState as WechatPaymentOrderTradeStateEnum,
          bankType: queryOrderResp.bankType,
          totalFee: queryOrderResp.totalFee,
          settlementTotalFee: Number(queryOrderResp.settlementTotalFee) || 0,
          feeType: queryOrderResp.feeType,
          cashFee: Number(queryOrderResp.cashFee) || 0,
          cashFeeType: queryOrderResp.cashFeeType,
          transactionId: queryOrderResp.transactionId,
          outTradeNo: queryOrderResp.outTradeNo,
          attach: queryOrderResp.attach,
          timeEnd: queryOrderResp.timeEnd,
          merchantId,
          userId,
          scene: attach.scene,
        },
        { outTradeNo },
        userId,
      );
    } catch (err) {
      this.logger.error(err);
      return null;
    }
  }

  /**
   * 生成微信支付订单
   * @param orderId
   * @param orderNo
   * @param payPrice
   * @param payClientIp
   * @param param4
   */
  async genWechatPayOrder(
    body: string,
    totalFee: number,
    attach: QS.ParsedUrlQueryInput,
    payClientIp: string,
    openid: string,
    merchantId: number,
    outTradeNo?: string,
  ): Promise<ClientRechargeWechatPaySignData> {
    const merchantInfo = await this.merchantEntityService.findById(merchantId, {
      select: [
        'name',
        'address',
        'countyCode',
        'allowPrivateWechat',
        'agentId',
      ],
    });
    const [officialAccountConfig, paymentConfig] = await Promise.all([
      this.merchamtWechatService.getOfficialAccountConfig(
        merchantId,
        merchantInfo,
      ),
      this.merchamtWechatService.getPaymentConfig(merchantId, merchantInfo),
    ]);
    const paymentAccount = await this.merchamtWechatService.getPayment({
      merchantId,
      paymentConfig,
      appId: officialAccountConfig.appId,
    });
    outTradeNo = outTradeNo || UtilHelperProvider.generateOrderNo();
    // 发起微信预支付
    const orderResp = await paymentAccount.pay.unifiedorder({
      body: `${merchantInfo.name}-${body}`,
      spbillCreateIp: payClientIp,
      attach: QS.stringify(attach),
      outTradeNo,
      totalFee: MathHelperProvider.multiply(totalFee || 0.01, 100) as number,
      tradeType: WechatPaymentOrderTradeTypeEnum.JSAPI,
      openid,
      sceneInfo: {
        id: String(merchantId),
        name: merchantInfo.name,
        areaCode: String(merchantInfo.countyCode),
        address: merchantInfo.address,
      },
    });
    await this.setUserPayTradeNo(openid, outTradeNo);
    const timeStamp = String(Math.ceil(Date.now() / 1000));
    const nonceStr = orderResp.nonceStr;
    const packageStr = `prepay_id=${orderResp.prepayId}`;
    const signType = 'MD5';
    const signParams = {
      signType,
      timeStamp,
      nonceStr,
      package: packageStr,
      appId: orderResp.appid,
    };
    const paySign = paymentAccount.pay.makePaySign(signParams);
    return {
      appId: signParams.appId,
      paySign,
      signType,
      timeStamp,
      nonceStr,
      orderNo: outTradeNo,
      package: packageStr,
    };
  }

  getRechargePlanGiftAmount(
    amount: number,
    planList: MerchantRechargePlanEntity[],
  ) {
    planList.sort((a, b) => b.rechargeAmount - a.rechargeAmount);
    for (const plan of planList) {
      if (amount >= plan.rechargeAmount) {
        return plan.donationAmount;
      }
    }
    return 0;
  }

  /**
   * 用户充值提交微信充值订单
   */
  async wechatPay(
    { planId, encryptRechargeAmount }: ClientRechargeParamsDTO,
    identity: ClientIdentity,
    request: FastifyRequest,
  ) {
    const { merchantId, userId, openid } = identity;
    const rechargeSetting = await this.getRechargeSetting(identity);
    const planList = await this.getPlanList(identity);
    let rechargeAmount: number,
      giftAmount = 0;
    if (rechargeSetting.allowCustomAmount === AllowCustomAmountEnum.FALSE) {
      const plan = planList.rows.find(item => item.id === planId);
      if (!plan) {
        throw new ClientRechargeNoPlanIdException();
      }
      rechargeAmount = plan.rechargeAmount;
      giftAmount = plan.donationAmount || 0;
    } else {
      if (!encryptRechargeAmount) {
        throw new ClientRechargeInvalidAmountException();
      }
      rechargeAmount = Number(
        CryptoHelperProvider.base64Decode(encryptRechargeAmount),
      );
      if (
        rechargeSetting.allowAutoMatchSetMeal === AllowAutoMatchSetMealEnum.TRUE
      ) {
        giftAmount = this.getRechargePlanGiftAmount(
          rechargeAmount,
          planList.rows,
        );
      }
    }
    if (!rechargeAmount) {
      throw new ClientRechargeInvalidAmountException();
    }
    return this.genWechatPayOrder(
      '用户账户充值',
      rechargeAmount,
      {
        userId,
        merchantId,
        scene: WechatPaymentOrderSceneEnum.RECHARGE,
        giftAmount,
      },
      request.ip,
      openid,
      merchantId,
    );
  }

  /**
   * 缓存微信支付交易号，有效期30分
   * @param openid
   * @param outTradeNo
   */
  async setUserPayTradeNo(openid: string, outTradeNo: string) {
    await this.cacheProvider.set(
      CLIENT_USER_WECHAT_TRADE_NO + openid,
      outTradeNo,
      {
        ttl: 30 * 60,
      },
    );
  }

  /**
   * 获取微信支付交易号
   * @param openid
   */
  async getUserPayTradeNo(openid: string) {
    return this.cacheProvider.get<string>(CLIENT_USER_WECHAT_TRADE_NO + openid);
  }

  /**
   * 删除微信支付交易号
   * @param openid
   */
  async delUserPayTradeNo(openid: string) {
    return this.cacheProvider.del(CLIENT_USER_WECHAT_TRADE_NO + openid);
  }
}
