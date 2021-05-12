import { Injectable, Inject } from '@nestjs/common';
import {
  MerchantGameActivityEntity,
  MerchantGamePrizeEntity,
  MerchantGoodsEntity,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  MerchantGameActivityDTO,
  MerchantGameActivityListDTO,
} from './activity.dto';
import {
  Transaction,
  TransactionRepository,
  Repository,
  InjectService,
} from '@jiaxinjiang/nest-orm';
import {
  MEELUO_SHOP_DATABASE,
  CLIENT_GAME_ACTIVITY_USER_FREE_NUM_PREFIX,
} from '@core/constant';
import { AdminGameService } from '@app/admin/game';
import { MerchantGoodsService } from '@app/merchant/goods';
import { OrmService } from '@typeorm/orm.service';
import { MerchantGameExistsException } from './activity.exception';
import { MerchantGameService } from '../game.service';
import { MerchantUserGameFreeNumData } from './activity.dto';
import { DateHelperProvider } from '@shared/helper';
import { CacheProvider } from '@jiaxinjiang/nest-redis';

@Injectable()
export class MerchantGameActivityService extends BaseService {
  constructor(
    @Inject(CacheProvider)
    private cacheService: CacheProvider,
    @Inject(AdminGameService)
    private adminGameService: AdminGameService,
    @Inject(MerchantGoodsService)
    private goodsService: MerchantGoodsService,
    @Inject(MerchantGameService)
    private gameService: MerchantGameService,
    @InjectService(MerchantGameActivityEntity)
    private activityEntityService: OrmService<MerchantGameActivityEntity>,
    @InjectService(MerchantGamePrizeEntity)
    private prizeEntityService: OrmService<MerchantGamePrizeEntity>,
  ) {
    super();
  }

  /**
   * 查询游戏活动列表
   * @param query
   * @param param1
   */
  async list(
    query: MerchantGameActivityListDTO,
    { merchantId }: MerchantIdentity,
  ) {
    const { pageIndex, pageSize } = query;
    const result = await this.activityEntityService.findAndCount({
      relations: ['adminGame', 'adminGame.thumbnail'], // 确定关联字段不为空的情况，才可以使用 relations
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        merchantId,
      },
      order: {
        id: 'DESC',
      },
    });
    await this.gameService.bindMerchantGameInfo(
      result.rows.map(item => item.adminGame),
      merchantId,
    );
    return {
      rows: this.clearExtraFields(result.rows, true),
      count: result.count,
    };
  }

  /**
   * 商家新增游戏活动
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async create(
    data: MerchantGameActivityDTO,
    identity: MerchantIdentity,
    @TransactionRepository(MerchantGameActivityEntity)
    activityRepo?: Repository<MerchantGameActivityEntity>,
    @TransactionRepository(MerchantGamePrizeEntity)
    prizeRepo?: Repository<MerchantGamePrizeEntity>,
  ) {
    const activityService = this.getService<
      MerchantGameActivityEntity,
      OrmService<MerchantGameActivityEntity>
    >(activityRepo);
    const prizeService = this.getService<
      MerchantGamePrizeEntity,
      OrmService<MerchantGamePrizeEntity>
    >(prizeRepo);
    const { user, merchantId } = identity;
    // 检查游戏活动状态
    await this.check(data.adminGameId, identity);
    const gameInfo = await activityService.create(
      { ...data, merchantId },
      user.id,
    );
    const prizeList = await prizeService.createMany(
      data.prizeList.map(item => ({
        ...item,
        merchantId,
        adminGameId: data.adminGameId,
        gameActivityId: gameInfo.id,
      })),
      user.id,
    );
    gameInfo.gamePrizeList = prizeList;
    return gameInfo;
  }

  /**
   * 删除游戏活动
   * @param id
   * @param param1
   */
  async delete(id: number, { user, merchantId }: MerchantIdentity) {
    await this.activityEntityService.delete(
      {
        id,
        merchantId,
      },
      user.id,
    );
    return true;
  }

  /**
   * 商家修改游戏活动
   * @param id
   * @param data
   * @param param2
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async update(
    id: number,
    data: MerchantGameActivityDTO,
    { user, merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantGameActivityEntity)
    activityRepo?: Repository<MerchantGameActivityEntity>,
    @TransactionRepository(MerchantGamePrizeEntity)
    prizeRepo?: Repository<MerchantGamePrizeEntity>,
  ) {
    const activityService = this.getService<
      MerchantGameActivityEntity,
      OrmService<MerchantGameActivityEntity>
    >(activityRepo);
    const prizeService = this.getService<
      MerchantGamePrizeEntity,
      OrmService<MerchantGamePrizeEntity>
    >(prizeRepo);
    const prizeList = data.prizeList;
    delete data.prizeList;
    await activityService.update(
      { ...data, merchantId },
      {
        id,
        merchantId,
      },
      user.id,
    );
    // 这里完全删除，不做软删除
    await prizeRepo.delete({
      gameActivityId: id,
      merchantId,
    });
    await prizeService.createMany(
      prizeList.map(item => ({
        ...item,
        merchantId,
        adminGameId: data.adminGameId,
        gameActivityId: id,
      })),
      user.id,
    );
    return true;
  }

  /**
   * 检验游戏活动状态
   * @param id
   * @param param1
   */
  async check(id: number, { merchantId }: MerchantIdentity) {
    const count = await this.activityEntityService.count({
      adminGameId: id,
      merchantId,
    });
    if (count > 0) {
      throw new MerchantGameExistsException();
    }
    return true;
  }

  /**
   * 获取游戏活动详情
   * @param id
   * @param identity
   */
  async detail(id: number, merchantId: number) {
    const gameActivity = await this.activityEntityService.findOne({
      where: {
        id,
        merchantId,
      },
    });
    if (!gameActivity) {
      return null;
    }
    // 从缓存里获取游戏详情
    gameActivity.adminGame = await this.adminGameService.detail(
      gameActivity.adminGameId,
    );
    // 获取商户游戏信息
    await this.gameService.bindMerchantGameInfo(
      gameActivity.adminGame,
      merchantId,
    );
    // 获取奖品列表
    gameActivity.gamePrizeList = await this.prizeEntityService.find({
      where: {
        gameActivityId: id,
        merchantId,
      },
    });
    const goods: MerchantGoodsEntity[] = [];
    // 从缓存里获取奖品列表
    for (const item of gameActivity.gamePrizeList) {
      if (item?.goodsId) {
        const target = goods.find(val => val?.id === item.goodsId);
        if (target) {
          item.goods = target;
        } else {
          item.goods = await this.goodsService.detail(item.goodsId, merchantId);
          goods.push(item.goods);
        }
      }
    }
    return this.clearExtraFields(gameActivity, true);
  }

  /**
   * 设置赢奖游戏用户免费次数缓存
   * @param activityId
   * @param userId
   * @param data
   */
  async setActivityUserFreeNum(
    activityId: number,
    userId: number,
    data: MerchantUserGameFreeNumData,
  ) {
    const todaySurplus = DateHelperProvider.getTodaySurplus();
    const key = `${CLIENT_GAME_ACTIVITY_USER_FREE_NUM_PREFIX}${activityId}:${userId}`;
    await this.cacheService.setHash(key, data);
    await this.cacheService.expire(key, todaySurplus);
    return data;
  }

  /**
   * 获取赢奖游戏用户免费次数缓存
   * @param activityId
   * @param userId
   */
  async getActivityUserFreeNum(activityId: number, userId: number) {
    const key = `${CLIENT_GAME_ACTIVITY_USER_FREE_NUM_PREFIX}${activityId}:${userId}`;
    const value: MerchantUserGameFreeNumData = await this.cacheService.getHash(
      key,
    );
    return value;
  }
}
