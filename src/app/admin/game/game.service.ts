import { Injectable, Inject } from '@nestjs/common';
import {
  AdminGameEntity,
  AdminGameDifficultyEntity,
  MerchantGameActivityEntity,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import { ModifyAdminGameDTO, AdminGameListDTO } from './game.dto';
import {
  AdminGameNotAllowDeleteException,
  AdminGameNameRepeatException,
} from './game.exception';
import {
  In,
  TransactionRepository,
  Transaction,
  Repository,
  InjectService,
} from '@jiaxinjiang/nest-orm';
import { ADMIN_GAME_USER_SESSION_PREFIX } from '@core/constant';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { ServiceCache, CacheProvider } from '@jiaxinjiang/nest-redis';
import { OrmService } from '@typeorm/orm.service';
import { ResourceService } from '@app/common/resource';
import { AdminGameSessionHash } from './game.interface';
import { BaseEntity } from '@typeorm/base.entity';

@Injectable()
export class AdminGameService extends BaseService {
  constructor(
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @Inject(ResourceService)
    private resourceService: ResourceService,
    @InjectService(AdminGameEntity)
    private gameEntityService: OrmService<AdminGameEntity>,
    @InjectService(AdminGameDifficultyEntity)
    private difficultyEntityService: OrmService<AdminGameDifficultyEntity>,
    @InjectService(MerchantGameActivityEntity)
    private activityEntityService: OrmService<MerchantGameActivityEntity>,
  ) {
    super();
  }

  /**
   * 获取游戏列表
   * @param param0
   * @param param1
   */
  async list({
    pageSize,
    pageIndex,
    categoryId,
    name,
    isWinning,
  }: AdminGameListDTO) {
    const result = await this.gameEntityService.findAndCount({
      relations: ['category'], // 确定关联字段不为空的情况，才可以使用 relations
      where: {
        categoryId,
        isWinning,
        name_contains: name,
      },
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      order: {
        id: 'DESC',
      },
    });
    await this.resourceService.bindTargetResource(
      result.rows,
      'thumbnail',
      'thumbnailId',
    );
    return {
      rows: this.clearExtraFields(result.rows, true),
      count: result.count,
    };
  }

  /**
   * 获取游戏详情
   * @param id
   * @param param1
   */
  @ServiceCache(7200) // 缓存2小时
  async detail(id: number, _cacheOptions?: { __updateCache: boolean }) {
    const game = await this.gameEntityService.findById(id, {
      relations: ['category'],
    });
    if (!game) {
      return null;
    }
    await this.resourceService.bindTargetResource(
      game,
      'thumbnail',
      'thumbnailId',
    );
    await this.resourceService.bindTargetResourceList(
      game,
      this.gameEntityService.repository,
      'images',
    );
    const difficulty = await this.difficultyEntityService.find({
      where: {
        gameId: id,
      },
    });
    game.difficulty = difficulty;
    return this.clearExtraFields(game);
  }

  /**
   * 创建游戏
   * @param data
   * @param identity
   * @param gameRepo
   * @param difficultyRepo
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async create(
    { game, difficulty = [], imageIds = [] }: ModifyAdminGameDTO,
    { user }: AdminIdentity,
    @TransactionRepository(AdminGameEntity)
    gameRepo?: Repository<AdminGameEntity>,
    @TransactionRepository(AdminGameDifficultyEntity)
    difficultyRepo?: Repository<AdminGameDifficultyEntity>,
  ) {
    const gameEntityService = this.getService<
      AdminGameEntity,
      OrmService<AdminGameEntity>
    >(gameRepo);
    const difficultyEntityService = this.getService<
      AdminGameDifficultyEntity,
      OrmService<AdminGameDifficultyEntity>
    >(difficultyRepo);
    await this.checkDuplicateName(game.name);
    const gameInfo = await gameEntityService.create(game, user.id);
    if (difficulty.length) {
      await difficultyEntityService.createMany(
        difficulty.map(item => ({ ...item, gameId: gameInfo.id })),
        user.id,
      );
    }
    if (imageIds.length) {
      await gameRepo
        .createQueryBuilder()
        .relation(AdminGameEntity, 'images')
        .of(gameInfo.id)
        .add(imageIds);
    }
    return gameInfo;
  }

  /**
   * 修改游戏
   * @param data
   * @param identity
   * @param gameRepo
   * @param difficultyRepo
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async update(
    id: number,
    { game, difficulty = [], imageIds = [] }: ModifyAdminGameDTO,
    { user }: AdminIdentity,
    @TransactionRepository(AdminGameEntity)
    gameRepo?: Repository<AdminGameEntity>,
    @TransactionRepository(AdminGameDifficultyEntity)
    difficultyRepo?: Repository<AdminGameDifficultyEntity>,
  ) {
    const gameEntityService = this.getService<
      AdminGameEntity,
      OrmService<AdminGameEntity>
    >(gameRepo);
    const difficultyEntityService = this.getService<
      AdminGameDifficultyEntity,
      OrmService<AdminGameDifficultyEntity>
    >(difficultyRepo);
    await this.checkDuplicateName(game.name, id);
    const gameInfo = await gameEntityService.findById(id, {
      select: ['id'],
    });
    await this.resourceService.bindTargetResourceList(
      gameInfo,
      gameRepo,
      'images',
    );
    const removeImages = gameInfo.images.map(img => img.id);
    await gameEntityService.updateById({ ...game }, id, user.id);
    await gameRepo
      .createQueryBuilder()
      .relation(AdminGameEntity, 'images')
      .of(id)
      .addAndRemove(imageIds, removeImages);
    await difficultyRepo.delete({
      gameId: id,
    });
    await difficultyEntityService.createMany(
      difficulty.map(item => ({ ...item, gameId: gameInfo.id })),
      user.id,
    );
    // 清除缓存
    await this.clearGameCache(id);
    return true;
  }

  /**
   * 删除游戏
   * @param id
   * @param param1
   */
  async delete(id: number, { user }: AdminIdentity) {
    const count = await this.activityEntityService.count({
      adminGameId: id,
    });
    if (count) {
      throw new AdminGameNotAllowDeleteException();
    }
    await this.gameEntityService.deleteById(id, user.id);
    // 清除缓存
    await this.clearGameCache(id);
    return true;
  }

  /**
   * 清除游戏活动详情缓存
   * @param id
   * @param merchantId
   */
  async clearGameCache(ids: number | number[]) {
    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    return Promise.all([
      ids.map(id => this.cacheProvider.clearServiceCache(this.detail, id)),
    ]);
  }

  /**
   * 检查游戏名称是否已经存在
   * @param adminGameId
   * @param name
   */
  async checkDuplicateName(name: string, id?: number) {
    if (!name) {
      return;
    }
    const gameInfo = await this.gameEntityService.findOne({
      select: ['id'],
      where: {
        name,
      },
    });
    if (!id ? gameInfo : gameInfo && gameInfo.id !== id) {
      throw new AdminGameNameRepeatException();
    }
  }

  /**
   * 设置用户游戏会话缓存，24小时
   * 一个商户下用户只能有一个游戏会话。
   * 因为系统单点登陆，所以一个人不可能同时玩多个游戏，主要为了限制某些想钻空子的技术同行
   * @param userId
   * @param merchantId
   */
  async setUserGameSession({
    userId,
    gameId,
    merchantId = 0,
    isCheck = 0,
  }: {
    userId: number;
    gameId: number;
    merchantId?: number;
    isCheck?: 0 | 1;
  }) {
    const key = `${ADMIN_GAME_USER_SESSION_PREFIX}${userId}:${merchantId}`;
    const data: AdminGameSessionHash = {
      gameId,
      isCheck,
    };
    await this.cacheProvider.setHash(key, data);
    await this.cacheProvider.expire(key, 3600);
  }

  /**
   * 获取用户游戏会话缓存
   * @param userId
   * @param merchantId
   */
  async getUserGameSession({
    userId,
    merchantId = 0,
  }: {
    userId: number;
    merchantId?: number;
  }): Promise<AdminGameSessionHash> {
    const key = `${ADMIN_GAME_USER_SESSION_PREFIX}${userId}:${merchantId}`;
    return this.cacheProvider.getHash(key);
  }

  /**
   * 删除用户游戏会话缓存
   * @param userId
   * @param merchantId
   */
  async delUserGameSession({
    userId,
    merchantId = 0,
  }: {
    userId: number;
    merchantId?: number;
  }) {
    const key = `${ADMIN_GAME_USER_SESSION_PREFIX}${userId}:${merchantId}`;
    await this.cacheProvider.del(key);
  }

  /**
   * 给目标对象绑定游戏信息
   * @param entitys
   * @param property
   * @param idProperty
   */
  async bindAdminGame<T extends BaseEntity>(
    entitys: T,
    property: keyof T,
    idProperty: keyof T,
  ): Promise<T>;
  async bindAdminGame<T extends BaseEntity>(
    entitys: T[],
    property: keyof T,
    idProperty: keyof T,
  ): Promise<T[]>;
  async bindAdminGame<T extends BaseEntity>(
    entitys: T | T[],
    property: keyof T,
    idProperty: keyof T,
  ) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets: T[] = Array.isArray(entitys) ? entitys : [entitys];
    const gameIds = Array.from(new Set(targets.map(item => item[idProperty])));
    const gameList = await this.gameEntityService.find({
      where: { id: In(gameIds.length ? gameIds : [null]) },
    });
    await this.resourceService.bindTargetResource(
      gameList,
      'thumbnail',
      'thumbnailId',
    );
    targets.forEach((target: any) => {
      target[property] =
        gameList.find((item: any) => item.id === target[idProperty]) || null;
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }
}
