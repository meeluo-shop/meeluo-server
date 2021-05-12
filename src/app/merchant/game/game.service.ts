import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import {
  AdminGameService,
  AdminGameCategoryService,
  AdminGameCategoryListDTO,
} from '@app/admin/game';
import {
  InjectService,
  Not,
  In,
  FindConditions,
  Between,
} from '@jiaxinjiang/nest-orm';
import { ResourceService } from '@app/common/resource';
import { OrmService } from '@typeorm/orm.service';
import {
  AdminGameEntity,
  MerchantGameActivityEntity,
  MerchantGameEntity,
  MerchantGameInviteEntity,
  MerchantGameIsActiveEnum,
  MerchantGameOrderEntity,
  MerchantGameRankingEntity,
} from '@typeorm/meeluoShop';
import {
  MerchantGameListDTO,
  ModifyMerchantGameInfoDTO,
  MerchantGameIdsDTO,
  MerchantGameOrderListDTO,
  MerchantGameInviteListDTO,
} from './game.dto';
import { MerchantGameNameRepeatException } from './game.exception';
import { MerchantUserService } from '../user';
import { BaseEntity } from '@typeorm/base.entity';

@Injectable()
export class MerchantGameService extends BaseService {
  constructor(
    @Inject(AdminGameService)
    private adminGameService: AdminGameService,
    @Inject(AdminGameCategoryService)
    private adminGameCatService: AdminGameCategoryService,
    @Inject(ResourceService)
    private resourceService: ResourceService,
    @Inject(MerchantUserService)
    private merchantUserService: MerchantUserService,
    @InjectService(AdminGameEntity)
    private gameEntityService: OrmService<AdminGameEntity>,
    @InjectService(MerchantGameEntity)
    private merchantGameEntityService: OrmService<MerchantGameEntity>,
    @InjectService(MerchantGameOrderEntity)
    private orderEntityService: OrmService<MerchantGameOrderEntity>,
    @InjectService(MerchantGameRankingEntity)
    private gameRankingEntityService: OrmService<MerchantGameRankingEntity>,
    @InjectService(MerchantGameInviteEntity)
    private inviteEntityService: OrmService<MerchantGameInviteEntity>,
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
  async list(
    {
      pageSize,
      pageIndex,
      categoryId,
      name,
      isWinning,
      isActive,
    }: MerchantGameListDTO,
    { ids }: MerchantGameIdsDTO,
    merchantId: number,
  ) {
    const where: FindConditions<AdminGameEntity> = ids?.length
      ? { id: In(ids) }
      : {};
    if (isActive > -1) {
      const disabledGames = await this.merchantGameEntityService.find({
        select: ['adminGameId'],
        where: {
          merchantId,
          isActive: MerchantGameIsActiveEnum.FALSE,
        },
      });
      const disabledGameIds = disabledGames.map(item => item.adminGameId);
      if (isActive === MerchantGameIsActiveEnum.TRUE) {
        if (ids?.length > 0) {
          const activeIds = ids.filter(id => !disabledGameIds.includes(id));
          where.id = activeIds.length ? In(activeIds) : null;
        } else {
          where.id = disabledGameIds.length
            ? Not(In(disabledGameIds))
            : undefined;
        }
      } else if (isActive === MerchantGameIsActiveEnum.FALSE) {
        if (ids?.length > 0) {
          const activeIds = disabledGameIds.filter(id => ids.includes(id));
          where.id = activeIds.length ? In(activeIds) : null;
        } else {
          where.id = disabledGameIds.length ? In(disabledGameIds) : null;
        }
      }
    }
    const result = await this.gameEntityService.findAndCount({
      relations: ['category'], // 确定关联字段不为空的情况，才可以使用 relations
      where: {
        ...where,
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
    await Promise.all([
      this.resourceService.bindTargetResource(
        result.rows,
        'thumbnail',
        'thumbnailId',
      ),
      this.bindMerchantGameInfo(result.rows, merchantId),
      this.bindMerchantActivityGameInfo(result.rows, merchantId),
    ]);
    return {
      rows: this.clearExtraFields(result.rows, true),
      count: result.count,
    };
  }

  /**
   * 获取游戏分类列表
   * @param param0
   * @param param1
   */
  async categoryList(query: AdminGameCategoryListDTO) {
    return this.adminGameCatService.list(query);
  }

  /**
   * 获取游戏详情
   * @param param0
   * @param param1
   */
  async detail(id: number, merchantId: number, userId: number) {
    const gameInfo = await this.adminGameService.detail(id);
    await this.bindMerchantGameInfo(gameInfo, merchantId);
    if (!gameInfo) {
      return gameInfo;
    }
    await this.bindMerchantActivityGameInfo(gameInfo, merchantId);
    if (!gameInfo.merchantGame?.id) {
      gameInfo.merchantGame = await this.initMerchangGame(
        id,
        merchantId,
        userId,
        false,
      );
    }
    return gameInfo;
  }

  /**
   * 绑定商户下的游戏信息
   * @param entitys
   * @param merchantId
   */
  async bindMerchantGameInfo(
    entitys: AdminGameEntity,
    merchantId: number,
  ): Promise<AdminGameEntity>;
  async bindMerchantGameInfo(
    entitys: AdminGameEntity[],
    merchantId: number,
  ): Promise<AdminGameEntity[]>;
  async bindMerchantGameInfo(
    entitys: AdminGameEntity | AdminGameEntity[],
    merchantId: number,
  ): Promise<AdminGameEntity | AdminGameEntity[]> {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const gameIds = Array.from(new Set(targets.map(item => item.id)));
    const merchantGames = await this.merchantGameEntityService.find({
      where: { merchantId, adminGameId: In(gameIds) },
    });
    targets.forEach(target => {
      target.merchantGame = merchantGames.find(
        item => item.adminGameId === target.id,
      );
      if (!target.merchantGame) {
        target.merchantGame = new MerchantGameEntity();
        target.merchantGame.adminGameId = target.id;
      }
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 绑定商户下的游戏活动信息
   * @param entitys
   * @param merchantId
   */
  async bindMerchantActivityGameInfo(
    entitys: AdminGameEntity,
    merchantId: number,
  ): Promise<AdminGameEntity>;
  async bindMerchantActivityGameInfo(
    entitys: AdminGameEntity[],
    merchantId: number,
  ): Promise<AdminGameEntity[]>;
  async bindMerchantActivityGameInfo(
    entitys: AdminGameEntity | AdminGameEntity[],
    merchantId: number,
  ): Promise<AdminGameEntity | AdminGameEntity[]> {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const gameIds = Array.from(new Set(targets.map(item => item.id)));
    const activityGames = await this.activityEntityService.find({
      where: { merchantId, adminGameId: In(gameIds) },
    });
    targets.forEach(target => {
      target.activityGame = activityGames.find(
        item => item.adminGameId === target.id,
      );
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 绑定游戏挑战记录信息
   * @param entitys
   * @param property
   * @param idProperty
   */
  async bindMerchantGameRanking<T extends BaseEntity>(
    entitys: T,
    property: keyof T,
    idProperty: keyof T,
  ): Promise<T>;
  async bindMerchantGameRanking<T extends BaseEntity>(
    entitys: T[],
    property: keyof T,
    idProperty: keyof T,
  ): Promise<T[]>;
  async bindMerchantGameRanking<T extends BaseEntity>(
    entitys: T | T[],
    property: keyof T,
    idProperty: keyof T,
  ) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets: T[] = Array.isArray(entitys) ? entitys : [entitys];
    const rankingIds = Array.from(
      new Set(targets.map(item => item[idProperty])),
    );
    const rankingList = await this.gameRankingEntityService.find({
      where: { id: In(rankingIds.length ? rankingIds : [null]) },
    });
    targets.forEach((target: any) => {
      target[property] =
        rankingList.find((item: any) => item.id === target[idProperty]) || null;
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 启用/禁用游戏
   * @param id
   * @param isActive
   * @param param2
   */
  async active(
    id: number,
    isActive: MerchantGameIsActiveEnum,
    identity: MerchantIdentity,
  ) {
    const { userId, merchantId } = identity;
    await this.initMerchangGame(id, merchantId, userId);
    await this.merchantGameEntityService.update(
      { isActive },
      {
        merchantId,
        adminGameId: id,
      },
      userId,
    );
    return true;
  }

  /**
   * 商家修改游戏信息
   * @param id
   * @param body
   * @param param2
   */
  async update(
    id: number,
    body: ModifyMerchantGameInfoDTO,
    identity: MerchantIdentity,
  ) {
    const { userId, merchantId } = identity;
    await this.checkDuplicateName(id, merchantId, body.name);
    await this.initMerchangGame(id, merchantId, userId);
    await this.merchantGameEntityService.update(
      { ...body },
      {
        merchantId,
        adminGameId: id,
      },
      userId,
    );
    return true;
  }

  /**
   * 检查游戏名称是否已经存在
   * @param adminGameId
   * @param merchantId
   * @param name
   */
  async checkDuplicateName(
    adminGameId: number,
    merchantId: number,
    name: string,
  ) {
    if (!name) {
      return;
    }
    const gameInfo = await this.merchantGameEntityService.findOne({
      select: ['adminGameId'],
      where: {
        name,
        merchantId,
      },
    });
    if (gameInfo && gameInfo.adminGameId !== adminGameId) {
      throw new MerchantGameNameRepeatException();
    }
  }

  /**
   * 初始化商户游戏数据
   * @param adminGameId
   * @param param1
   */
  async initMerchangGame(
    adminGameId: number,
    merchantId: number,
    userId: number,
    isCheck = true,
  ) {
    let entity = new MerchantGameEntity();
    if (isCheck) {
      entity = await this.merchantGameEntityService.findOne({
        where: {
          merchantId,
          adminGameId,
        },
      });
    }
    if (!entity.id) {
      return await this.merchantGameEntityService.create(
        {
          merchantId,
          adminGameId,
        },
        userId,
      );
    }
    return entity;
  }

  /**
   * 预览游戏时生成游戏会话
   * @param userId
   * @param merchantId
   * @param gameId
   */
  setUserGameSession(params: {
    userId: number;
    merchantId: number;
    gameId: number;
  }) {
    return this.adminGameService.setUserGameSession(params);
  }

  /**
   * 获取游戏邀请好友记录
   * @param param0
   * @param param1
   */
  async inviteList(
    {
      pageSize,
      pageIndex,
      inviteUserId,
      startTime,
      endTime,
      adminGameId,
      status,
      isNewUser,
    }: MerchantGameInviteListDTO,
    { merchantId }: MerchantIdentity,
  ) {
    const condition: FindConditions<MerchantGameInviteEntity> & {
      [key: string]: any;
    } = {
      merchantId,
      inviteUserId,
      adminGameId,
      status,
      isNewUser,
    };
    if (startTime) {
      condition.createdAt = Between(startTime, endTime || new Date());
    } else {
      condition.createdAt_lte = endTime;
    }
    const records = await this.inviteEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        ...condition,
      },
      order: {
        id: 'DESC',
      },
    });

    // 绑定用户和游戏信息
    await Promise.all([
      this.adminGameService.bindAdminGame<MerchantGameInviteEntity>(
        records.rows,
        'adminGame',
        'adminGameId',
      ),
      this.merchantUserService.bindMerchantUser(
        records.rows,
        'merchantUser',
        'merchantUserId',
      ),
      this.merchantUserService.bindMerchantUser(
        records.rows,
        'inviteUser',
        'inviteUserId',
      ),
    ]);
    return records;
  }

  /**
   * 获取游戏付费订单列表
   * @param param0
   * @param param1
   */
  async orderList(
    {
      pageSize,
      pageIndex,
      startTime,
      endTime,
      adminGameId,
      payType,
    }: MerchantGameOrderListDTO,
    { merchantId }: MerchantIdentity,
  ) {
    const condition: FindConditions<MerchantGameInviteEntity> & {
      [key: string]: any;
    } = {
      merchantId,
      payType,
      adminGameId,
    };
    if (startTime) {
      condition.createdAt = Between(startTime, endTime || new Date());
    } else {
      condition.createdAt_lte = endTime;
    }
    const records = await this.orderEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        ...condition,
      },
      order: {
        id: 'DESC',
      },
    });

    // 绑定用户和游戏信息
    await Promise.all([
      this.bindMerchantGameRanking<MerchantGameOrderEntity>(
        records.rows,
        'gameRanking',
        'gameRankingId',
      ),
      this.adminGameService.bindAdminGame<MerchantGameOrderEntity>(
        records.rows,
        'adminGame',
        'adminGameId',
      ),
      this.merchantUserService.bindMerchantUser(
        records.rows,
        'merchantUser',
        'merchantUserId',
      ),
    ]);
    return records;
  }
}
