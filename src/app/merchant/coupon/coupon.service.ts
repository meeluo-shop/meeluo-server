import * as moment from 'moment';
import { Inject, Injectable } from '@nestjs/common';
import {
  MerchantCouponEntity,
  MerchantCouponGrantEntity,
  MerchantCouponExpireTypeEnum,
  MerchantCouponIsUsedEnum,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  MerchantCouponDTO,
  MerchantCouponListDTO,
  MerchantCouponGrantListDTO,
  MerchantCouponGrantIsAvailableEnum,
} from './coupon.dto';
import {
  GetMerchantCouponDetailFailedException,
  MerchantCouponExpiredException,
  MerchantCouponErrorTypeException,
  MerchantCouponNotEffectiveTimeException,
} from './coupon.exception';
import {
  InjectService,
  FindConditions,
  MoreThan,
  LessThanOrEqual,
  In,
  Transaction,
  TransactionRepository,
  Repository,
} from '@jiaxinjiang/nest-orm';
import { OrmService } from '@typeorm/orm.service';
import { BaseEntity, IsDeleteEnum } from '@typeorm/base.entity';
import { MerchantUserService } from '../user';
import { MEELUO_SHOP_DATABASE } from '@core/constant';

@Injectable()
export class MerchantCouponService extends BaseService {
  constructor(
    @Inject(MerchantUserService)
    private merchantUserService: MerchantUserService,
    @InjectService(MerchantCouponEntity)
    private couponEntityService: OrmService<MerchantCouponEntity>,
    @InjectService(MerchantCouponGrantEntity)
    private grantEntityService: OrmService<MerchantCouponGrantEntity>,
  ) {
    super();
  }

  /**
   * 查询优惠券列表
   * @param query
   * @param param1
   */
  async list(query: MerchantCouponListDTO, { merchantId }: MerchantIdentity) {
    const { pageIndex, pageSize, color, type, expireType } = query;
    return this.couponEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        color,
        type,
        expireType,
        merchantId,
      },
      order: {
        order: 'ASC',
      },
    });
  }

  /**
   * 查看优惠券详情
   * @param id
   * @param param1
   */
  async detail(id: number, merchantId: number) {
    return this.couponEntityService.findOne({
      where: {
        id,
        merchantId,
      },
    });
  }

  /**
   * 创建优惠券
   * @param data
   * @param param1
   */
  async create(
    data: MerchantCouponDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    return this.couponEntityService.create(
      {
        ...data,
        merchantId,
      },
      user.id,
    );
  }

  /**
   * 修改优惠券
   * @param id
   * @param data
   * @param param2
   */
  async update(
    id: number,
    data: MerchantCouponDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    await this.couponEntityService.update(
      data,
      {
        id,
        merchantId,
      },
      user.id,
    );
    return true;
  }

  /**
   * 删除优惠券
   * @param id
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async delete(
    id: number,
    { userId, merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantCouponEntity)
    couponRepo?: Repository<MerchantCouponEntity>,
    // @TransactionRepository(MerchantCouponGrantEntity)
    // couponGrantRepo?: Repository<MerchantCouponGrantEntity>,
  ) {
    const couponEntityService = this.getService(couponRepo);
    // const grantEntityService = this.getService(couponGrantRepo);
    // await grantEntityService.delete(
    //   {
    //     couponId: id,
    //     merchantId,
    //   },
    //   userId,
    // );
    await couponEntityService.delete(
      {
        id,
        merchantId,
      },
      userId,
    );
    return true;
  }

  /**
   * 检查优惠券是否有效
   * @param couponId
   * @param merchantId
   * @returns
   */
  async checkCoupon(id: number, merchantUserId: number, merchantId: number) {
    const coupon = await this.grantEntityService.findOne({
      where: {
        id,
        merchantId,
        merchantUserId,
      },
    });
    if (!coupon) {
      throw new GetMerchantCouponDetailFailedException();
    }
    const currentDate = new Date();
    switch (coupon.expireType) {
      case MerchantCouponExpireTypeEnum.FIXED_TIME:
        if (coupon.endTime < currentDate || coupon.startTime > currentDate) {
          throw new MerchantCouponNotEffectiveTimeException();
        }
        break;
      case MerchantCouponExpireTypeEnum.AFTER_RECEIVING:
        if (coupon.expireTime < currentDate) {
          throw new MerchantCouponNotEffectiveTimeException();
        }
        break;
      default:
        throw new MerchantCouponErrorTypeException();
    }
    return coupon;
  }

  /**
   * 方法优惠券事务方法
   * @param param0
   * @param couponRepo
   * @param couponGrantRepo
   * @returns
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async grantTransaction(
    {
      merchantUserId,
      couponId,
      merchantId,
      grantNum,
      staffId,
    }: {
      merchantUserId: number;
      couponId: number;
      grantNum?: number;
      merchantId: number;
      staffId?: number;
    },
    @TransactionRepository(MerchantCouponEntity)
    couponRepo?: Repository<MerchantCouponEntity>,
    @TransactionRepository(MerchantCouponGrantEntity)
    couponGrantRepo?: Repository<MerchantCouponGrantEntity>,
  ) {
    return this.grant(
      {
        merchantUserId,
        couponId,
        merchantId,
        grantNum,
        staffId,
      },
      couponRepo,
      couponGrantRepo,
    );
  }

  /**
   * 发放优惠券
   * @param merchantUserId
   * @param couponId
   */
  async grant(
    {
      merchantUserId,
      couponId,
      merchantId,
      grantNum = 1,
      staffId = null,
    }: {
      merchantUserId: number;
      couponId: number;
      grantNum?: number;
      merchantId: number;
      staffId?: number;
    },
    couponRepo: Repository<MerchantCouponEntity>,
    couponGrantRepo: Repository<MerchantCouponGrantEntity>,
  ) {
    const coupon = await this.detail(couponId, merchantId);
    if (!coupon) {
      throw new GetMerchantCouponDetailFailedException();
    }
    if (
      coupon.expireType === MerchantCouponExpireTypeEnum.FIXED_TIME &&
      coupon.endTime < new Date()
    ) {
      throw new MerchantCouponExpiredException();
    }
    const couponEntityService = this.getService(couponRepo);
    const grantEntityService = this.getService(couponGrantRepo);
    await couponEntityService.repository.increment(
      {
        id: couponId,
      },
      'receiveNum',
      grantNum,
    );
    return grantEntityService.createMany(
      new Array(grantNum).fill('').map(() => ({
        couponId,
        merchantUserId,
        name: coupon.name,
        color: coupon.color,
        type: coupon.type,
        reducePrice: coupon.reducePrice,
        discount: coupon.discount,
        minPrice: coupon.minPrice,
        expireType: coupon.expireType,
        expireDay: coupon.expireDay,
        expireTime:
          coupon.expireType === MerchantCouponExpireTypeEnum.AFTER_RECEIVING
            ? moment()
                .add(coupon.expireDay, 'day')
                .toDate()
            : null,
        startTime: coupon.startTime,
        endTime: coupon.endTime,
        isUsed: MerchantCouponIsUsedEnum.FALSE,
        staffId,
        merchantId,
      })),
      staffId || merchantUserId,
    );
  }

  /**
   * 获取优惠券领取列表
   * @param param0
   * @param param1
   */
  async grantList(query: MerchantCouponGrantListDTO, merchantId: number) {
    const {
      pageIndex,
      pageSize,
      color,
      type,
      expireType,
      isUsed,
      isAvailable,
      couponId,
      merchantUserId,
    } = query;
    const condition: FindConditions<MerchantCouponGrantEntity> = {
      couponId,
      merchantUserId,
      color,
      type,
      expireType,
      merchantId,
      isUsed,
    };
    let where:
      | FindConditions<MerchantCouponGrantEntity>
      | Array<FindConditions<MerchantCouponGrantEntity>> = {
      ...condition,
    };
    if (isAvailable !== undefined) {
      const now = new Date();
      where = [
        {
          ...condition,
          isDelete: IsDeleteEnum.FALSE,
          expireTime:
            isAvailable === MerchantCouponGrantIsAvailableEnum.TRUE
              ? (where.expireTime = MoreThan(now))
              : LessThanOrEqual(now),
        },
        {
          ...condition,
          isDelete: IsDeleteEnum.FALSE,
          startTime:
            isAvailable === MerchantCouponGrantIsAvailableEnum.TRUE
              ? (where.expireTime = LessThanOrEqual(now))
              : MoreThan(now),
          endTime:
            isAvailable === MerchantCouponGrantIsAvailableEnum.TRUE
              ? (where.expireTime = MoreThan(now))
              : LessThanOrEqual(now),
        },
      ];
    }
    const grantList = await this.grantEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where,
      order: {
        id: 'DESC',
      },
    });
    await this.merchantUserService.bindMerchantUser(
      grantList.rows,
      'merchantUser',
      'merchantUserId',
    );
    return grantList;
  }

  /**
   * 绑定优惠券信息
   * @param entitys
   * @param merchantId
   */
  async bindCouponInfo<T extends BaseEntity>(
    entitys: T,
    property: keyof T,
    idProperty: keyof T,
  ): Promise<T>;
  async bindCouponInfo<T extends BaseEntity>(
    entitys: T[],
    property: keyof T,
    idProperty: keyof T,
  ): Promise<T[]>;
  async bindCouponInfo<T extends BaseEntity>(
    entitys: T | T[],
    property: keyof T,
    idProperty: keyof T,
  ): Promise<T | T[]> {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const couponIds = Array.from(
      new Set(targets.map(item => item[idProperty])),
    ).filter(item => !!item);
    if (!couponIds.length) {
      return Array.isArray(entitys) ? targets : targets[0];
    }
    const couponList = await this.couponEntityService.find({
      where: { id: In(couponIds) },
    });
    targets.forEach((target: any) => {
      target[property] = couponList.find(
        item => item.id === target[idProperty],
      );
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }
}
