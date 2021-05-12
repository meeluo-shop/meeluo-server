import { BaseService } from '@app/app.service';
import {
  Between,
  FindConditions,
  In,
  InjectService,
} from '@jiaxinjiang/nest-orm';
import { Inject, Injectable } from '@nestjs/common';
import {
  MerchantUserPointsLogEntity,
  MerchantUserEntity,
} from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { MerchantPointsListDTO } from './points.dto';
import { MerchantUserService } from '@app/merchant/user/user.service';

@Injectable()
export class MerchantPointsService extends BaseService {
  constructor(
    @Inject(MerchantUserService)
    private merchantUserService: MerchantUserService,
    @InjectService(MerchantUserEntity)
    private userEntityService: OrmService<MerchantUserEntity>,
    @InjectService(MerchantUserPointsLogEntity)
    private userPointsLogEntityService: OrmService<MerchantUserPointsLogEntity>,
  ) {
    super();
  }

  /**
   * 获取积分明细
   * @param query
   * @param merchantId
   */
  async log(
    {
      startTime,
      endTime,
      type,
      nickname,
      userId,
      pageSize,
      pageIndex,
    }: MerchantPointsListDTO,
    merchantId: number,
  ) {
    let users: MerchantUserEntity[];
    const condition: FindConditions<MerchantUserPointsLogEntity> & {
      [key: string]: any;
    } = {
      type,
      merchantUserId: userId,
      merchantId,
    };
    if (startTime) {
      condition.createdAt = Between(startTime, endTime || new Date());
    } else {
      condition.createdAt_lte = endTime;
    }
    if (nickname) {
      users = await this.userEntityService.find({
        select: ['id'],
        take: 100,
        where: {
          merchantId,
          nickname_contains: nickname,
        },
      });
      if (users.length) {
        condition.merchantUserId = In(users.map(user => user.id));
      }
    }
    const balanceLogs = await this.userPointsLogEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        ...condition,
      },
      order: {
        id: 'DESC',
      },
    });
    await this.merchantUserService.bindMerchantUser(
      balanceLogs.rows,
      'merchantUser',
      'merchantUserId',
    );
    return balanceLogs;
  }
}
