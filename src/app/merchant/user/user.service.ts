import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import { InjectService, Brackets, In, Repository } from '@jiaxinjiang/nest-orm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { OrmService } from '@typeorm/orm.service';
import {
  MerchantUserGradeEntity,
  MerchantUserEntity,
  MerchantUserIsActiveEnum,
  MerchantBaseEntity,
  WechatUserEntity,
  MerchantUserPointsLogEntity,
  MerchantUserPointsModifyTypeEnum,
  MerchantUserBalanceLogSceneEnum,
  MerchantUserBalanceLogEntity,
  MerchantUserBalanceModifyTypeEnum,
  MerchantOrderPayTypeEnum,
  MerchantMenuOrderPayTypeEnum,
} from '@typeorm/meeluoShop';
import { MathHelperProvider } from '@shared/helper';
import { CLIENT_USER_CHANGED_PREFIX } from '@core/constant';
import { MerchantUserListDTO, MerchantModifyUserDTO } from './user.dto';
import { MerchantUpdateUserException } from './user.exception';
import { CacheProvider } from '@jiaxinjiang/nest-redis';
import { MerchantUserGradeService } from './grade/grade.service';

@Injectable()
export class MerchantUserService extends BaseService {
  constructor(
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @Inject(MerchantUserGradeService)
    private gradeService: MerchantUserGradeService,
    @InjectService(WechatUserEntity)
    private wechatUserEntityService: OrmService<WechatUserEntity>,
    @InjectService(MerchantUserEntity)
    private userEntityService: OrmService<MerchantUserEntity>,
    @InjectService(MerchantUserGradeEntity)
    private gradeEntityService: OrmService<MerchantUserGradeEntity>,
  ) {
    super();
  }

  /**
   * 更改用户积分
   * @param userId
   * @param value
   * @param type
   * @param description
   * @param userRepo
   * @param userPointsLogRepo
   */
  async modifyUserPoints(
    userId: number,
    merchantId: number,
    value: number,
    type: MerchantUserPointsModifyTypeEnum,
    description: string,
    remark: string,
    repository: {
      userRepo: Repository<MerchantUserEntity>; // 传递事务repository用
      userPointsLogRepo: Repository<MerchantUserPointsLogEntity>; // 传递事务repository用
    },
    checkVersion = true,
  ) {
    if (value <= 0) {
      return true;
    }
    if (userId) {
      return false;
    }
    const { userRepo, userPointsLogRepo } = repository;
    const userEntityService = this.getService(userRepo);
    const userPointsLogEntityService = this.getService(userPointsLogRepo);
    const userinfo = await userEntityService.findById(userId, {
      select: ['point', 'version'],
    });
    let symbol = '';
    switch (type) {
      case MerchantUserPointsModifyTypeEnum.ADD:
        symbol = '+';
        break;
      case MerchantUserPointsModifyTypeEnum.SUBTRACT:
        if (userinfo?.point < value) {
          throw new MerchantUpdateUserException({ msg: '积分不足' });
        }
        symbol = '-';
        break;
    }
    if (!symbol) {
      return false;
    }
    let queryBuilder = userEntityService.repository
      .createQueryBuilder()
      .update(MerchantUserEntity)
      .where('id = :id', { id: userId });
    if (checkVersion) {
      queryBuilder = queryBuilder.andWhere('version = :version', {
        version: userinfo.version,
      });
    }
    await queryBuilder
      .set({
        point: () => `point ${symbol} ${value}`,
      })
      .execute();
    await userPointsLogEntityService.create(
      {
        description,
        type,
        value,
        remark,
        merchantUserId: userId,
        merchantId,
      },
      userId,
    );
    return true;
  }

  /**
   * 更改用户余额
   * @param userId
   * @param value
   * @param type
   * @param description
   * @param remark
   * @param userRepo
   * @param userBalanceLogRepo
   */
  async modifyUserBalance(
    userId: number,
    merchantId: number,
    money: number,
    type: MerchantUserBalanceModifyTypeEnum,
    scene: MerchantUserBalanceLogSceneEnum,
    payType: MerchantOrderPayTypeEnum | MerchantMenuOrderPayTypeEnum,
    description: string,
    remark: string,
    repositorys: {
      userRepo: Repository<MerchantUserEntity>; // 传递事务repository用
      userBalanceLogRepo: Repository<MerchantUserBalanceLogEntity>; // 传递事务repository用
    },
    checkVersion = false,
  ) {
    if (money <= 0) {
      return true;
    }
    const { userRepo, userBalanceLogRepo } = repositorys;
    const modifyUserData: QueryDeepPartialEntity<MerchantUserEntity> = {};
    const userEntityService = this.getService(userRepo);
    const userBalanceLogEntityService = this.getService(userBalanceLogRepo);
    const userinfo = await userEntityService.findById(userId, {
      select: [
        'merchantId',
        'balance',
        'version',
        'realTotalRecharge',
        'gradeId',
        'totalRecharge',
      ],
    });
    if (!userinfo) {
      throw new MerchantUpdateUserException({ msg: '当前用户不存在' });
    }
    if (userinfo.merchantId !== merchantId) {
      throw new MerchantUpdateUserException({ msg: '用户与商家不匹配' });
    }
    await this.gradeService.bindUsersGrade(userinfo, merchantId);
    let symbol = '';
    switch (type) {
      case MerchantUserBalanceModifyTypeEnum.ADD:
        symbol = '+';
        // 累计增加充值金额
        modifyUserData.totalRecharge = () => `total_recharge + ${money}`;
        if (payType === MerchantOrderPayTypeEnum.WECHAT) {
          // 累计增加真实充值金额
          modifyUserData.realTotalRecharge = () =>
            `real_total_recharge + ${money}`;
        }
        const totalRecharge = MathHelperProvider.add(
          userinfo.totalRecharge || 0,
          money,
        );
        // 判断充值金额是否足够升级会员
        const grade = await this.gradeService.getUpgradeGrade(
          totalRecharge || 0,
          merchantId,
        );
        // 判断当前用户的会员等级权重是否小于要升级的会员等级权重
        if (
          grade &&
          (!userinfo.grade || grade.weight > userinfo.grade?.weight)
        ) {
          modifyUserData.gradeId = grade.id;
        }
        break;
      case MerchantUserBalanceModifyTypeEnum.SUBTRACT:
        symbol = '-';
        if (Number(userinfo?.balance) < Number(money)) {
          throw new MerchantUpdateUserException({ msg: '余额不足' });
        }
        // 累计增加消费金额
        modifyUserData.totalConsumption = () => `total_consumption + ${money}`;
        break;
    }
    if (!symbol) {
      return false;
    }
    let queryBuilder = userEntityService.repository
      .createQueryBuilder()
      .update(MerchantUserEntity)
      .where('id = :id', { id: userId });
    if (checkVersion) {
      queryBuilder = queryBuilder.andWhere('version = :version', {
        version: userinfo.version,
      });
    }
    await queryBuilder
      .set({
        ...modifyUserData,
        balance: () => `balance ${symbol} ${money}`,
      })
      .execute();
    await userBalanceLogEntityService.create(
      {
        description,
        type,
        scene,
        money,
        remark,
        merchantUserId: userId,
        merchantId,
      },
      userId,
    );
    return true;
  }

  /**
   * 获取用户列表
   * @param param0
   * @param param1
   */
  async list(
    { pageIndex, pageSize, wechatName, phone, gradeId }: MerchantUserListDTO,
    { merchantId }: MerchantIdentity,
  ) {
    let queryBuilder = this.userEntityService.repository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.wechatUser', 'wechatUser')
      .where('user.merchantId = :merchantId', { merchantId });
    // 处理会员等级查询条件
    if (gradeId) {
      const grade = await this.gradeEntityService.findOne({
        where: { merchantId, id: gradeId },
      });
      queryBuilder = queryBuilder.andWhere(
        new Brackets(qb => {
          qb = qb.where('user.gradeId = :gradeId', { gradeId });
          // 如果该会员等级为默认，查询所有没绑定会员的用户
          if (grade.isDefault) {
            qb.orWhere('user.gradeId is null');
          }
        }),
      );
    }
    // 处理手机号查询条件
    if (phone) {
      queryBuilder = queryBuilder.andWhere('user.phone like :phone', {
        phone: `%${phone}%`,
      });
    }
    // 处理微信昵称查询条件
    if (wechatName) {
      queryBuilder = queryBuilder.andWhere('user.nickname like :wechatName', {
        wechatName: `%${wechatName}%`,
      });
    }
    const [rows, count] = await queryBuilder
      .skip((pageIndex - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.id', 'DESC')
      .getManyAndCount();
    const result = {
      rows,
      count,
    };
    if (!rows.length) {
      return result;
    }
    await this.gradeService.bindUsersGrade(result.rows, merchantId);
    return result;
  }

  /**
   * 启用/禁用用户
   * @param id
   * @param isActive
   * @param param2
   */
  async active(
    id: number,
    isActive: MerchantUserIsActiveEnum,
    { user, merchantId }: MerchantIdentity,
  ) {
    await this.userEntityService.update(
      { isActive },
      {
        id,
        merchantId,
      },
      user.id,
    );
    // 标记一下用户被修改的状态
    await this.setUserChangedSign(id, ['isActive']);
    return true;
  }

  /**
   * 修改用户信息
   * @param id
   * @param data
   * @param param2
   */
  async update(
    id: number,
    data: MerchantModifyUserDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    if (data.phone) {
      const user = await this.userEntityService.findOne({
        select: ['id'],
        where: {
          merchantId,
          phone: data.phone,
        },
      });
      if (user?.id && user?.id !== id) {
        throw new MerchantUpdateUserException({
          msg: '当前手机号已存在，请勿重复绑定',
        });
      }
    }
    await this.userEntityService.update(
      { ...data },
      {
        id,
        merchantId,
      },
      user.id,
    );
    // 标记一下用户被修改的状态
    if (!data.isActive) {
      await this.setUserChangedSign(id, ['isActive']);
    }
    return true;
  }

  /**
   * 在缓存中标记用户信息被修改状态
   * @param userId
   * @param fields
   */
  async setUserChangedSign(
    userId: number,
    fields: Array<keyof MerchantUserEntity | string> = [],
  ) {
    const key = CLIENT_USER_CHANGED_PREFIX + userId;
    await this.cacheProvider.set(key, JSON.stringify(fields), {
      ttl: 3600 * 24 * 7,
    });
  }

  /**
   * 从缓存中获取用户信息被修改状态
   * @param userId
   */
  async getUserChangedSign(
    userId: number,
  ): Promise<Array<keyof MerchantUserEntity>> {
    const key = CLIENT_USER_CHANGED_PREFIX + userId;
    const value = await this.cacheProvider.get<string>(key);
    // 取完删除状态
    await this.cacheProvider.del(key);
    return JSON.parse(value);
  }

  /**
   * 绑定用户信息到目标对象上
   * @param entitys
   * @param property
   * @param idProperty
   */
  async bindMerchantUser<T extends MerchantBaseEntity>(
    entitys: T,
    property: keyof T,
    idProperty: keyof T,
  ): Promise<T>;
  async bindMerchantUser<T extends MerchantBaseEntity>(
    entitys: T[],
    property: keyof T,
    idProperty: keyof T,
  ): Promise<T[]>;
  async bindMerchantUser<T extends MerchantBaseEntity>(
    entitys: T | T[],
    property: keyof T,
    idProperty: keyof T,
  ) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets: T[] = Array.isArray(entitys) ? entitys : [entitys];
    const userIds = Array.from(new Set(targets.map(item => item[idProperty])));
    const users = await this.userEntityService.find({
      where: { id: In(userIds.length ? userIds : [null]) },
    });
    targets.forEach((target: any) => {
      target[property] =
        users.find(item => item.id === target[idProperty]) || null;
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 绑定微信用户信息到目标对象上
   * @param entitys
   * @param property
   * @param idProperty
   */
  async bindWechatUser<T extends MerchantBaseEntity>(
    entitys: T,
    property: keyof T,
    openidProperty: keyof T,
  ): Promise<T>;
  async bindWechatUser<T extends MerchantBaseEntity>(
    entitys: T[],
    property: keyof T,
    openidProperty: keyof T,
  ): Promise<T[]>;
  async bindWechatUser<T extends MerchantBaseEntity>(
    entitys: T | T[],
    property: keyof T,
    openidProperty: keyof T,
  ) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets: T[] = Array.isArray(entitys) ? entitys : [entitys];
    const openIds = Array.from(
      new Set(targets.map(item => item[openidProperty])),
    );
    const wechatUsers = await this.wechatUserEntityService.find({
      where: { openid: In(openIds.length ? openIds : [null]) },
    });
    targets.forEach((target: any) => {
      target[property] =
        wechatUsers.find(item => item.openid === target[openidProperty]) ||
        null;
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }
}
