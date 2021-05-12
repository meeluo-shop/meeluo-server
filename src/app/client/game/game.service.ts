import * as moment from 'moment';
import { FastifyRequest } from 'fastify';
import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import {
  FindConditions,
  InjectService,
  Repository,
  Transaction,
  TransactionRepository,
} from '@jiaxinjiang/nest-orm';
import { OrmService } from '@typeorm/orm.service';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';
import {
  AdminGameEntity,
  MerchantGameEntity,
  MerchantGameActivityEntity,
  MerchantGameRankingEntity,
  MerchantGamePrizeEntity,
  MerchantGoodsEntity,
  MerchantGameIsActiveEnum,
  MerchantGameRankingIsMaxEnum,
  MerchantGameWinningEntity,
  MerchantGameWinningGoodsEntity,
  MerchantGameWinningStatusEnum,
  MerchantGameOrderEntity,
  WechatPaymentOrderSceneEnum,
  MerchantGameOrderPayTypeEnum,
  MerchantUserEntity,
  MerchantUserBalanceLogEntity,
  MerchantUserBalanceModifyTypeEnum,
  MerchantUserBalanceLogSceneEnum,
  MerchantOrderPayTypeEnum,
  MerchantGoodsSkuEntity,
  MerchantGameInviteEntity,
  MerchantGameInviteStatusEnum,
} from '@typeorm/meeluoShop';
import {
  CryptoHelperProvider,
  DateHelperProvider,
  UtilHelperProvider,
} from '@shared/helper';
import {
  MerchantGameActivityService,
  MerchantGameService,
} from '@app/merchant/game';
import { MerchantWechatQRCodeService } from '@app/merchant/wechat/qrcode';
import { AdminGameCategoryService, AdminGameService } from '@app/admin/game';
import { MerchantWechatTemplateService } from '@app/merchant/wechat/template';
import {
  ClientGameIdsDTO,
  ClientGameOverDTO,
  ClientGameOverRespDTO,
  ClientGameListByPrizeDTO,
  ClientGameListByPrizeResp,
  ClientGameLeaveWordDTO,
  ClientGameScoreRankingRespDTO,
  ClientGamePlayGameResp,
  ClientGameSignDTO,
  ClientGameCheckSessionDTO,
  ClientGameInviteRewardDTO,
} from './game.dto';
import { ClientRechargeWechatPaySignData } from '../recharge/recharge.dto';
import {
  CLIENT_USER_GAME_WINNING_COUNT,
  MEELUO_SHOP_DATABASE,
} from '@core/constant';
import {
  ClientGameSaveScoreException,
  ClientGamePaySessionException,
  ClientGameBalancePayFailedException,
} from './game.exception';
import { MerchantGoodsService } from '@app/merchant/goods';
import { MerchantOrderService } from '@app/merchant/order';
import { AdminGameCategoryListDTO, AdminGameListDTO } from '@app/admin/game';
import { ClientUserService } from '../user';
import { ClientRechargeService } from '../recharge';
import { MerchantUserService } from '@app/merchant/user';
import { ClientGamePrizeSettingService } from './setting';
import { OrderMessageTypeEnum } from '@app/consumer/order';
import { CacheProvider } from '@jiaxinjiang/nest-redis';
import { MerchantGamePrizeSettingDTO } from '@app/merchant/game/prize/setting';

@Injectable()
export class ClientGameService extends BaseService {
  constructor(
    @InjectLogger(ClientGameService)
    private logger: LoggerProvider,
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @Inject(ClientUserService)
    private userService: ClientUserService,
    @Inject(ClientRechargeService)
    private rechargeService: ClientRechargeService,
    @Inject(MerchantOrderService)
    private merchantOrderService: MerchantOrderService,
    @Inject(MerchantUserService)
    private merchantUserService: MerchantUserService,
    @Inject(MerchantGoodsService)
    private merchantGoodsService: MerchantGoodsService,
    @Inject(MerchantWechatQRCodeService)
    private wechatQRCodeService: MerchantWechatQRCodeService,
    @Inject(MerchantWechatTemplateService)
    private wechatTemplateService: MerchantWechatTemplateService,
    @Inject(MerchantGameService)
    private merchantGameService: MerchantGameService,
    @Inject(MerchantGameActivityService)
    private merchantGameActivityService: MerchantGameActivityService,
    @Inject(AdminGameService)
    private adminGameService: AdminGameService,
    @Inject(AdminGameCategoryService)
    private adminGameCategoryService: AdminGameCategoryService,
    @Inject(ClientGamePrizeSettingService)
    private prizeSettingService: ClientGamePrizeSettingService,
    @InjectService(AdminGameEntity)
    private adminGameEntityService: OrmService<AdminGameEntity>,
    @InjectService(MerchantGamePrizeEntity)
    private prizeEntityService: OrmService<MerchantGamePrizeEntity>,
    @InjectService(MerchantGameEntity)
    private merchantGameEntityService: OrmService<MerchantGameEntity>,
    @InjectService(MerchantGameOrderEntity)
    private merchantGameOrderEntityService: OrmService<MerchantGameOrderEntity>,
    @InjectService(MerchantGameActivityEntity)
    private activityEntityService: OrmService<MerchantGameActivityEntity>,
    @InjectService(MerchantGameRankingEntity)
    private rankingEntityService: OrmService<MerchantGameRankingEntity>,
    @InjectService(MerchantGameInviteEntity)
    private inviteEntityService: OrmService<MerchantGameInviteEntity>,
  ) {
    super();
  }

  /**
   * 付费参与赢奖游戏活动
   * @param activityInfo
   * @param identity
   * @param request
   */
  private async gamePay(
    activityInfo: MerchantGameActivityEntity,
    identity: ClientIdentity,
    request: FastifyRequest,
  ): Promise<ClientRechargeWechatPaySignData> {
    const { userId, merchantId, openid } = identity;
    // 创建游戏支付订单
    const gameOrder = await this.merchantGameOrderEntityService.create(
      {
        merchantId,
        price: activityInfo.playPrice,
        merchantUserId: userId,
        adminGameId: activityInfo.adminGameId,
      },
      userId,
    );
    return this.rechargeService.genWechatPayOrder(
      '参与游戏赢奖活动',
      activityInfo.playPrice,
      {
        userId,
        merchantId,
        scene: WechatPaymentOrderSceneEnum.PLAY_GAME,
        gameId: activityInfo.adminGameId,
      },
      request.ip,
      openid,
      merchantId,
      String(gameOrder.id),
    );
  }

  /**
   * 参与赢奖游戏
   * @param activityInfo
   * @param identity
   * @param request
   */
  private async playActivityGame(
    activityInfo: MerchantGameActivityEntity,
    identity: ClientIdentity,
    request: FastifyRequest,
  ) {
    const { userId } = identity;
    const freeNumCache = await this.merchantGameActivityService.getActivityUserFreeNum(
      activityInfo.id,
      userId,
    );
    const playActivityGameResp: ClientGamePlayGameResp = {
      freeNum:
        freeNumCache?.freeNum > -1
          ? freeNumCache.freeNum
          : activityInfo.freeNum,
      invitedFreeNum:
        freeNumCache?.invitedFreeNum > -1 ? freeNumCache.invitedFreeNum : 0,
    };
    // 判断免费次数和邀请奖励次数是否用完
    if (
      playActivityGameResp.freeNum < 1 &&
      playActivityGameResp.invitedFreeNum < 1
    ) {
      // 如果用完了，则生成支付预订单
      playActivityGameResp.paySignData = await this.gamePay(
        activityInfo,
        identity,
        request,
      );
    }
    if (playActivityGameResp.freeNum > 0) {
      // 优先扣除免费次数
      playActivityGameResp.freeNum -= 1;
    } else if (playActivityGameResp.invitedFreeNum > 0) {
      // 扣除邀请奖励次数
      playActivityGameResp.invitedFreeNum -= 1;
    }
    // 更新免费次数
    await this.merchantGameActivityService.setActivityUserFreeNum(
      activityInfo.id,
      userId,
      playActivityGameResp,
    );
    return playActivityGameResp;
  }

  /**
   * 用户参与游戏接口
   * @param id
   * @param merchantId
   */
  async playGame(
    id: number,
    identity: ClientIdentity,
    request: FastifyRequest,
  ): Promise<ClientGamePlayGameResp> {
    const { merchantId, userId } = identity;
    const activityInfo = await this.activityEntityService.findOne({
      where: {
        adminGameId: id,
        merchantId,
      },
    });
    let playActivityResp: ClientGamePlayGameResp;
    if (activityInfo && activityInfo.playPrice > 0) {
      playActivityResp = await this.playActivityGame(
        activityInfo,
        identity,
        request,
      );
    }
    // 生成挑战游戏会话，会话周期为玩家单局游戏时长（从点击开始按钮到游戏结束生成分数）
    // 最长有效期24小时，即用户游戏时常不得超过24小时，否则结果无效。
    // 一个用户在一个商户下只能存在一个游戏会话，所以直接覆盖。
    if (!playActivityResp?.paySignData) {
      // 如果需要支付，就不生成会话，等支付成功后再生成。
      await this.merchantGameService.setUserGameSession({
        userId,
        merchantId,
        gameId: id,
      });
    }
    // 获取当前用户挑战游戏记录，用来判断是否增加游戏挑战人数
    const [merchantUserPlayRecord, userPlayRecord] = await Promise.all([
      this.rankingEntityService.findOne({
        select: ['id'],
        where: {
          merchantId,
          adminGameId: id,
          merchantUserId: userId,
        },
      }),
      this.rankingEntityService.findOne({
        select: ['id'],
        where: {
          adminGameId: id,
          merchantUserId: userId,
        },
      }),
    ]);
    const playCountData = { playCount: () => `play_count + ${1}` };
    const playPeopleCountData = {
      playPeopleCount: () => `play_people_count + ${1}`,
    };
    await Promise.all([
      this.adminGameEntityService.repository
        .createQueryBuilder()
        .update(AdminGameEntity)
        .where('id = :id', { id })
        .set(
          userPlayRecord
            ? { ...playCountData }
            : { ...playCountData, ...playPeopleCountData },
        )
        .execute(),
      this.merchantGameEntityService.repository
        .createQueryBuilder()
        .update(MerchantGameEntity)
        .where('adminGameId = :id', { id })
        .andWhere('merchantId = :merchantId', { merchantId: merchantId })
        .set(
          merchantUserPlayRecord
            ? { ...playCountData }
            : { ...playCountData, ...playPeopleCountData },
        )
        .execute(),
    ]);
    return (
      playActivityResp || {
        freeNum: -1,
        invitedFreeNum: -1,
      }
    );
  }

  /**
   * 生成微信支付后的游戏会话
   * @param gameId
   * @param param1
   * @param param2
   */
  async setWechatPayGameSession(
    gameId: number,
    { sign, timestamp, payType }: ClientGameSignDTO,
    identity: ClientIdentity,
  ) {
    const { merchantId, userId } = identity;
    const decryptStr = CryptoHelperProvider.base64Decode(sign);
    const data: {
      gameId: string;
      timestamp: string;
      merchantId: string;
      userId: string;
      orderNo: string;
    } = JSON.parse(decryptStr);
    if (
      gameId !== Number(data.gameId) ||
      timestamp !== Number(data.timestamp) ||
      merchantId !== Number(data.merchantId) ||
      userId !== Number(data.userId)
    ) {
      throw new ClientGamePaySessionException({ msg: '无效的签名' });
    }
    const isValidOrder = await this.merchantGameOrderEntityService.count({
      payType: MerchantGameOrderPayTypeEnum.NULL,
      id: Number(data.orderNo),
      merchantUserId: userId,
      merchantId: merchantId,
    });
    if (!isValidOrder) {
      throw new ClientGamePaySessionException({ msg: '无效的订单号' });
    }
    await Promise.all([
      this.merchantGameService.setUserGameSession({
        userId,
        merchantId,
        gameId,
      }),
      this.merchantGameOrderEntityService.updateById(
        {
          payType,
        },
        Number(data.orderNo),
        userId,
      ),
      this.rechargeService.queryWechatPayOrder({
        identity,
        repeat: 3,
        isConsume: true,
        consumeDesc: `参与赢奖游戏：${data.orderNo}`,
      }),
    ]);
    return true;
  }

  /**
   * 使用余额支付游戏挑战费用
   */
  @Transaction({
    connectionName: MEELUO_SHOP_DATABASE,
    isolation: 'READ UNCOMMITTED',
  })
  async balancePay(
    orderId: number,
    identity: ClientIdentity,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserBalanceLogEntity)
    userBalanceLogRepo?: Repository<MerchantUserBalanceLogEntity>,
  ) {
    const { userId, merchantId } = identity;
    const orderInfo = await this.merchantGameOrderEntityService.findOne({
      where: {
        id: orderId,
        merchantUserId: userId,
      },
    });
    if (orderInfo?.payType !== MerchantGameOrderPayTypeEnum.NULL) {
      throw new ClientGameBalancePayFailedException({ msg: '无效的订单号' });
    }
    const activityInfo = await this.activityEntityService.findOne({
      select: ['playPrice'],
      where: {
        adminGameId: orderInfo.adminGameId,
        merchantId,
      },
    });
    await Promise.all([
      this.merchantGameService.setUserGameSession({
        userId,
        merchantId,
        gameId: orderInfo.adminGameId,
      }),
      this.merchantGameOrderEntityService.updateById(
        {
          payType: MerchantGameOrderPayTypeEnum.BALANCE,
        },
        orderId,
        userId,
      ),
    ]);
    // 扣除用户余额
    await this.merchantUserService.modifyUserBalance(
      userId,
      merchantId,
      activityInfo.playPrice,
      MerchantUserBalanceModifyTypeEnum.SUBTRACT,
      MerchantUserBalanceLogSceneEnum.USER_CONSUME,
      MerchantOrderPayTypeEnum.BALANCE,
      `参与赢奖游戏：${orderId}`,
      null,
      {
        userRepo,
        userBalanceLogRepo,
      },
    );
    return true;
  }

  /**
   * 查看当前挑战分数是否获奖
   * @param param0
   */
  async checkWinningPrize(
    {
      adminGameId,
      identity,
      score,
      rankingId,
    }: {
      adminGameId: number;
      score: number;
      rankingId: number;
      identity: ClientIdentity;
    },
    repository: {
      prizeRepo: Repository<MerchantGamePrizeEntity>;
      goodsSkuRepo: Repository<MerchantGoodsSkuEntity>;
      winningRepo: Repository<MerchantGameWinningEntity>;
      winningGoodsRepo: Repository<MerchantGameWinningGoodsEntity>;
    },
  ): Promise<MerchantGameWinningEntity | null> {
    const { merchantId, userId, openid } = identity;
    const {
      prizeRepo,
      goodsSkuRepo,
      winningRepo,
      winningGoodsRepo,
    } = repository;
    const prizeEntityService = this.getService(prizeRepo);
    const winningEntityService = this.getService(winningRepo);
    const winningGoodsEntityService = this.getService(winningGoodsRepo);
    // 获取商户游戏奖品设置
    const setting = await this.prizeSettingService.getGamePrizeSetting(
      merchantId,
    );
    // 查询当前商户活动游戏下所有奖品
    const prizeList = await prizeEntityService.find({
      where: {
        adminGameId,
        merchantId,
      },
    });
    // 奖品按分数从高到底排序
    prizeList.sort((a, b) => b.score - a.score);

    // 获取分数对应的奖品
    const getGoodsPrize = async (
      ignoreGoodsIds: number[] = [],
    ): Promise<MerchantGamePrizeEntity> => {
      let prize: MerchantGamePrizeEntity;
      for (const item of prizeList) {
        // 如果有库存不足的商品，则跳过
        if (ignoreGoodsIds.includes(item.goodsId)) {
          continue;
        }
        if (score >= item.score) {
          prize = item;
          break;
        }
      }
      if (!prize) {
        return prize;
      }
      prize.goods = await this.merchantGoodsService.detail(
        prize.goodsId,
        merchantId,
      );
      // 如果商品库存不足，则跳过，并找寻下级奖品
      if (
        !prize.goods ||
        !prize.goods.skus[0] ||
        prize.goods.skus[0].stock <= 0
      ) {
        ignoreGoodsIds.push(prize.goodsId);
        return getGoodsPrize(ignoreGoodsIds);
      }
      // 商品减库存
      await goodsSkuRepo.decrement({ id: prize.goods.skus[0].id }, 'stock', 1);
      // 清除商品缓存
      await this.merchantGoodsService.clearDetailCache(
        prize.goods.id,
        merchantId,
      );
      return prize;
    };
    const prize = await getGoodsPrize();
    // 如果没有获奖，直接返回null
    if (!prize?.goods) {
      return null;
    }
    // 如果获奖了，判断获奖次数是否达到每日上限
    const surplusWinningCount = await this.getSurplusWinningCount({
      userId,
      merchantId,
      setting,
    });
    // 0则是已达到上限，-1为不设置
    if (surplusWinningCount === 0) {
      // 如果是奖品到达上限，则返回undefined
      return;
    }
    // 增加获奖记录
    const winning = await winningEntityService.create(
      {
        adminGameId,
        merchantId,
        merchantUserId: userId,
        winningNo: UtilHelperProvider.generateOrderNo(),
        gameRankingId: rankingId,
        prizeType: prize.type,
        status: MerchantGameWinningStatusEnum.NO_RECEIVED,
      },
      userId,
    );
    // 增加获奖商品记录
    const sku = prize.goods.skus[0];
    const specValues = sku.specSkuId.split('_');
    let specs = '';
    prize.goods.specMappings.forEach(mapping => {
      if (specValues.includes(String(mapping.specValueId))) {
        specs += `${mapping.spec.name}：${mapping.specValue.value}；`;
      }
    });
    winning.winningGoods = await winningGoodsEntityService.create(
      {
        merchantId,
        winningId: winning.id,
        goodsId: prize.goods.id,
        giftCouponId: prize.goods.giftCouponId,
        name: prize.goods.name,
        sellingPoint: prize.goods.sellingPoint,
        thumbnailUrl: prize.goods.thumbnail.url,
        price: sku?.price || 0,
        specType: prize.goods.specType,
        content: prize.goods.content,
        specSkuId: sku?.specSkuId || '',
        specs,
        prizeGetMethods: prize.goods.prizeGetMethods,
      },
      userId,
    );
    if (setting.effectiveTime > 0) {
      // 给未领取订单增加定时任务，超过配置时间，自动取消
      await this.merchantOrderService.pushOrderDelayTask(
        OrderMessageTypeEnum.AUTO_EXPIRE_WINNING,
        {
          orderId: winning.id,
          merchantId,
          userId,
        },
        setting.effectiveTime * 24 * 3600 * 1000,
      );
    }
    // 发送获奖通知
    await this.sendWinningMessage({
      winningId: winning.id,
      prizeName: prize.goods.name,
      adminGameId,
      merchantId,
      openid,
    }).catch(err => this.logger.error(err));
    return winning;
  }

  /**
   * 获取用户每日剩余的可获奖次数，-1为不限制
   * @param param0
   */
  async getSurplusWinningCount({
    userId,
    merchantId,
    setting,
  }: {
    userId: number;
    merchantId: number;
    setting: MerchantGamePrizeSettingDTO;
  }): Promise<number> {
    const maxWinningCount = Number(setting.maxWinningCount) || 0;
    // 如果每日获奖上限设为0，或不做设置，则直接跳过
    if (!maxWinningCount) {
      return -1;
    }
    const redisKey = `${CLIENT_USER_GAME_WINNING_COUNT}:${merchantId}:${userId}`;
    const surplusTime = DateHelperProvider.getTodaySurplus();
    const redisVal = await this.cacheProvider.get(redisKey);
    const winningCount = Number(redisVal) || 0;
    // 判断当前获奖次数未超过每日获奖上限
    if (winningCount < setting.maxWinningCount) {
      // 用户获奖次数+1
      await this.cacheProvider.incr(redisKey, surplusTime);
    }
    // 返回剩余获奖次数
    return maxWinningCount - winningCount > 0
      ? maxWinningCount - winningCount
      : 0;
  }

  /**
   * 发送获奖通知
   * @param param0
   */
  async sendWinningMessage({
    winningId,
    prizeName,
    adminGameId,
    merchantId,
    openid,
  }: {
    openid: string;
    prizeName: string;
    adminGameId: number;
    winningId: number;
    merchantId: number;
  }) {
    const game = await this.adminGameEntityService.findById(adminGameId, {
      select: ['name'],
    });
    // 发送通知给用户自己
    await this.wechatTemplateService.sendWinningUserNotice(
      {
        winningId,
        winningTime: new Date(),
        prizeName,
        gameName: game.name,
        openid,
      },
      merchantId,
    );
  }

  /**
   * 用户挑战游戏结束
   * @param adminGameId
   * @param body
   * @param identity
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async gameOver(
    adminGameId: number,
    { score, orderId }: ClientGameOverDTO,
    identity: ClientIdentity,
    @TransactionRepository(MerchantGameRankingEntity)
    rankingRepo?: Repository<MerchantGameRankingEntity>,
    @TransactionRepository(MerchantGameOrderEntity)
    gameOrderRepo?: Repository<MerchantGameOrderEntity>,
    @TransactionRepository(MerchantGamePrizeEntity)
    prizeRepo?: Repository<MerchantGamePrizeEntity>,
    @TransactionRepository(MerchantGoodsSkuEntity)
    goodsSkuRepo?: Repository<MerchantGoodsSkuEntity>,
    @TransactionRepository(MerchantGameWinningEntity)
    winningRepo?: Repository<MerchantGameWinningEntity>,
    @TransactionRepository(MerchantGameWinningGoodsEntity)
    winningGoodsRepo?: Repository<MerchantGameWinningGoodsEntity>,
  ): Promise<ClientGameOverRespDTO> {
    const { merchantId, userId, openid } = identity;
    const rankingEntityService = this.getService(rankingRepo);
    const gameOrderEntityService = this.getService(gameOrderRepo);
    const decodedScore = CryptoHelperProvider.base64Decode(score);
    const scoreNumber = Number(
      CryptoHelperProvider.simpleDecrypto(decodedScore, 123, 25) || '0',
    );
    const gameSessionData = await this.adminGameService.getUserGameSession({
      userId,
      merchantId,
    });
    // 判断当前游戏会话是否正确（过滤异常渠道调用保存分数接口）
    if (gameSessionData?.gameId !== adminGameId) {
      throw new ClientGameSaveScoreException();
    }
    const [maxRanking, gameInfo] = await Promise.all([
      this.rankingEntityService.findOne({
        select: ['score'],
        order: {
          score: 'DESC',
          id: 'DESC',
        },
        where: {
          merchantId,
          adminGameId,
          merchantUserId: userId,
        },
      }),
      this.merchantGameService.detail(adminGameId, merchantId, userId),
      // 游戏会话结束，删除会话缓存
      this.adminGameService.delUserGameSession({ userId, merchantId }),
    ]);
    let maxScore: number = maxRanking?.score || 0;
    let isMaxRecord = MerchantGameRankingIsMaxEnum.FALSE;
    if (scoreNumber >= maxScore) {
      maxScore = scoreNumber;
      isMaxRecord = MerchantGameRankingIsMaxEnum.TRUE;
      await rankingEntityService.update(
        {
          isMax: MerchantGameRankingIsMaxEnum.FALSE,
        },
        {
          merchantId,
          adminGameId,
          merchantUserId: userId,
          isMax: MerchantGameRankingIsMaxEnum.TRUE,
        },
        userId,
      );
    }
    // 增加游戏分数记录
    const rankingInfo = await rankingEntityService.create(
      {
        name: gameInfo.merchantGame.name || gameInfo.name,
        description: gameInfo.merchantGame.description || gameInfo.description,
        thumbnailUrl: gameInfo.thumbnail.url,
        unit: gameInfo.unit,
        isWinning: gameInfo.isWinning,
        openid,
        adminGameId,
        score: scoreNumber,
        isMax: isMaxRecord,
        merchantId,
        merchantUserId: userId,
      },
      userId,
    );
    // 修改游戏订单信息
    if (orderId) {
      await gameOrderEntityService.update(
        {
          gameRankingId: rankingInfo.id,
        },
        {
          id: orderId,
          merchantId,
          merchantUserId: userId,
        },
        userId,
      );
    }
    const scoreRanking = await this.getScoreRanking(
      adminGameId,
      merchantId,
      scoreNumber,
    );
    let winning: MerchantGameWinningEntity = null;
    if (gameInfo.activityGame) {
      // 返回null表示未获得奖品，返回undefined表示已经超过每日获奖上限
      winning = await this.checkWinningPrize(
        {
          adminGameId,
          score: scoreNumber,
          identity,
          rankingId: rankingInfo.id,
        },
        {
          prizeRepo,
          goodsSkuRepo,
          winningRepo,
          winningGoodsRepo,
        },
      );
    }
    return {
      score: scoreNumber,
      maxScore,
      ranking: scoreRanking,
      recordId: rankingInfo.id,
      winning,
      gameInfo,
    };
  }

  /**
   * 无需授权获取的游戏详情
   * @param param0
   */
  async info({ gameId, merchantId, userId }: ClientGameCheckSessionDTO) {
    return this.detail(gameId, {
      merchantId,
      userId,
      staffId: null,
      merchantName: null,
      openid: null,
    });
  }

  /**
   * 获取游戏详情
   * @param gameId
   * @param param1
   */
  async detail(gameId: number, { merchantId, userId }: ClientIdentity) {
    const [gameInfo, activityInfo] = await Promise.all([
      this.merchantGameService.detail(gameId, merchantId, userId),
      this.activityEntityService.findOne({
        where: {
          adminGameId: gameId,
          merchantId,
        },
      }),
    ]);
    if (!gameInfo) {
      return gameInfo;
    }
    // 如果不是活动游戏，直接返回
    if (!activityInfo) {
      return gameInfo;
    }
    gameInfo.activityGame = activityInfo;
    // 获取奖品列表
    gameInfo.activityGame.gamePrizeList = await this.prizeEntityService.find({
      where: {
        gameActivityId: activityInfo.id,
        merchantId,
      },
    });
    const goods: MerchantGoodsEntity[] = [];
    // 从缓存里获取奖品列表
    for (const item of gameInfo.activityGame.gamePrizeList) {
      if (item?.goodsId) {
        const target = goods.find(val => val?.id === item.goodsId);
        if (target) {
          item.goods = target;
        } else {
          item.goods = await this.merchantGoodsService.detail(
            item.goodsId,
            merchantId,
          );
          goods.push(item.goods);
        }
      }
    }
    // 获取当前用户参与活动游戏免费次数
    const freeNumCache = await this.merchantGameActivityService.getActivityUserFreeNum(
      activityInfo.id,
      userId,
    );
    if (freeNumCache) {
      gameInfo.activityGame.freeNum =
        freeNumCache.freeNum + freeNumCache.invitedFreeNum;
    }
    return gameInfo;
  }

  /**
   * 根据奖品id，获取游戏列表
   * @param query
   * @param merchantId
   */
  async listByPrize({ prizeId }: ClientGameListByPrizeDTO, merchantId: number) {
    const where: FindConditions<MerchantGamePrizeEntity> = {
      merchantId,
      goodsId: prizeId,
    };
    const prizeList = await this.prizeEntityService.find({
      where,
    });
    const gameIds = Array.from(
      new Set(prizeList.map(prize => prize.adminGameId)),
    );
    if (!gameIds.length) {
      return {
        rows: [],
        count: 0,
      };
    }
    const gameResp = await this.list(
      { pageSize: gameIds.length },
      { ids: gameIds },
      merchantId,
    );
    gameResp.rows.forEach((item: ClientGameListByPrizeResp) => {
      item.prize = prizeList.find(prize => prize.adminGameId === item.id);
    });
    return gameResp;
  }

  /**
   * 获取活动游戏列表
   * @param query
   * @param param1
   */
  async activityList(query: AdminGameListDTO, { merchantId }: ClientIdentity) {
    const allActivityGames = await this.activityEntityService.find({
      where: {
        merchantId,
      },
    });
    const adminGameIds = allActivityGames.map(game => game.adminGameId);
    if (!adminGameIds.length) {
      return {
        rows: [],
        count: 0,
      };
    }
    return this.list(query, { ids: adminGameIds }, merchantId);
  }

  /**
   * 获取游戏列表
   * @param param0
   * @param param1
   */
  async list(
    query: AdminGameListDTO,
    { ids }: ClientGameIdsDTO,
    merchantId: number,
  ) {
    return this.merchantGameService.list(
      {
        isActive: MerchantGameIsActiveEnum.TRUE,
        ...query,
      },
      { ids },
      merchantId,
    );
  }

  /**
   * 获取游戏分数排名
   * @param adminGameId
   * @param merchantId
   * @param score
   */
  async getScoreRanking(
    adminGameId: number,
    merchantId: number,
    score?: number,
  ) {
    const rankingRange = 200;
    const scoreRecords = await this.rankingEntityService.find({
      take: rankingRange + 1,
      select: ['id'],
      order: {
        score: 'DESC',
      },
      where: {
        adminGameId,
        merchantId,
        isMax: MerchantGameRankingIsMaxEnum.TRUE,
        score_gt: score,
      },
    });
    if (scoreRecords.length > rankingRange) {
      return 0;
    } else if (scoreRecords.length === rankingRange) {
      return rankingRange;
    } else {
      return scoreRecords.length + 1;
    }
  }

  /**
   * 获取当前游戏分数排名，只计算200名以内
   * @param adminGameId
   * @param merchantId
   * @param userId
   */
  async getUserGameMaxRanking(
    adminGameId: number,
    merchantId: number,
    userId: number,
  ) {
    const rankingRange = 200;
    const maxScoreRecord: ClientGameScoreRankingRespDTO = await this.rankingEntityService.findOne(
      {
        select: ['score'],
        order: {
          score: 'DESC',
          id: 'DESC',
        },
        where: {
          merchantId,
          adminGameId,
          merchantUserId: userId,
        },
      },
    );
    if (!maxScoreRecord) {
      return null;
    }
    const scoreRecords = await this.rankingEntityService.find({
      take: rankingRange + 1,
      select: ['id'],
      order: {
        score: 'DESC',
      },
      where: {
        adminGameId,
        merchantId,
        isMax: MerchantGameRankingIsMaxEnum.TRUE,
        score_gt: maxScoreRecord.score,
      },
    });
    if (scoreRecords.length > rankingRange) {
      maxScoreRecord.rankingNumber = 0;
    } else if (scoreRecords.length === rankingRange) {
      maxScoreRecord.rankingNumber = rankingRange;
    } else {
      maxScoreRecord.rankingNumber = scoreRecords.length + 1;
    }
    return maxScoreRecord;
  }

  /**
   * 用户挑战游戏结束留言
   * @param body
   * @param param1
   */
  async leaveWord(
    { leaveWord, adminGameId }: ClientGameLeaveWordDTO,
    { merchantId, userId }: ClientIdentity,
  ) {
    const maxRanking = await this.rankingEntityService.findOne({
      select: ['id'],
      order: {
        score: 'DESC',
        id: 'DESC',
      },
      where: {
        merchantUserId: userId,
        merchantId,
        adminGameId,
      },
    });
    if (!maxRanking) {
      return false;
    }
    await this.rankingEntityService.updateById(
      {
        leaveWord,
      },
      maxRanking.id,
      userId,
    );
    return true;
  }

  /**
   * 获取游戏挑战记录排名
   * @param adminGameId
   * @param param1
   */
  async rankingList(
    adminGameId: number,
    number: number,
    { merchantId }: ClientIdentity,
  ) {
    const rankingList = await this.rankingEntityService.find({
      take: number,
      order: {
        score: 'DESC',
        id: 'DESC',
      },
      where: {
        merchantId,
        adminGameId,
        isMax: MerchantGameRankingIsMaxEnum.TRUE,
      },
    });
    await this.userService.merchantUserService.bindWechatUser(
      rankingList,
      'wechatUser',
      'openid',
    );
    return rankingList;
  }

  /**
   * 获取游戏分类列表
   * @param query
   */
  async categoryList(query: AdminGameCategoryListDTO) {
    return this.adminGameCategoryService.list(query);
  }

  /**
   * 获取游戏关注公众号二维码
   * @param adminGameId
   * @param identity
   */
  async getGameQRCode(
    adminGameId: number,
    { merchantId, userId }: ClientIdentity,
  ) {
    return this.wechatQRCodeService.getGameQRCode(
      adminGameId,
      merchantId,
      userId,
    );
  }

  /**
   * 游戏页面校验用户session
   * @param param0
   */
  async checkGameSession({
    userId,
    merchantId,
    gameId,
  }: ClientGameCheckSessionDTO) {
    const session = await this.adminGameService.getUserGameSession({
      userId,
      merchantId,
    });
    const result = gameId === session?.gameId && !session?.isCheck;
    if (!result) {
      return false;
    }
    await this.adminGameService.setUserGameSession({
      userId,
      merchantId,
      gameId,
      isCheck: 1,
    });
    return true;
  }

  /**
   * 增加游戏邀请奖励
   * @param param0
   * @param param1
   */
  async inviteReward(
    { adminGameId, inviteUserId, isNewUser }: ClientGameInviteRewardDTO,
    { merchantId, userId }: ClientIdentity,
  ) {
    // 判断是自己邀请自己，直接跳过
    if (inviteUserId === userId) {
      return null;
    }
    const inviteDate =
      Number(
        moment()
          .locale('zh-cn')
          .format('YYYYMMDD'),
      ) || 0;
    // 判断当前邀请是否有效
    const isInvited = await this.inviteEntityService.count({
      adminGameId,
      inviteUserId,
      merchantId,
      merchantUserId: userId,
      inviteDate,
    });
    // 如果当前用户今天已经被邀请过了，则直接返回false
    if (isInvited) {
      return null;
    }
    let inviteStatus: MerchantGameInviteStatusEnum =
      MerchantGameInviteStatusEnum.FAIL;
    const [activity, inviteCount] = await Promise.all([
      // 获取邀请好友获得的奖励次数和奖励上限
      this.activityEntityService.findOne({
        select: ['invitedFreeNum', 'maxInvitedNum'],
        where: {
          merchantId,
          adminGameId,
        },
      }),
      // 获取邀请人今天已经成功邀请的记录数量
      this.inviteEntityService.count({
        merchantId,
        adminGameId,
        inviteUserId,
        inviteDate,
        status: MerchantGameInviteStatusEnum.SUCCESS,
      }),
    ]);
    // 判断活动邀请奖励次数不为0，并且今天成功邀请的数量没有超过奖励上限
    if (activity?.invitedFreeNum > 0 && inviteCount < activity?.maxInvitedNum) {
      inviteStatus = MerchantGameInviteStatusEnum.SUCCESS;
      // 获取邀请人当前的免费次数
      const freeNumCache = await this.merchantGameActivityService.getActivityUserFreeNum(
        activity.id,
        inviteUserId,
      );
      // 增加邀请成功的免费次数
      freeNumCache.invitedFreeNum += Number(activity?.invitedFreeNum);
      // 更新免费次数
      await this.merchantGameActivityService.setActivityUserFreeNum(
        activity.id,
        inviteUserId,
        freeNumCache,
      );
    }
    // 增加邀请记录
    return this.inviteEntityService.create(
      {
        adminGameId,
        inviteUserId,
        merchantId,
        merchantUserId: userId,
        inviteDate,
        status: inviteStatus,
        isNewUser,
      },
      userId,
    );
  }
}
