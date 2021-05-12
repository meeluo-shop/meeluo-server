import { BaseService } from '@app/app.service';
import {
  Between,
  FindConditions,
  In,
  InjectService,
  Repository,
  Transaction,
  TransactionRepository,
} from '@jiaxinjiang/nest-orm';
import { Inject, Injectable } from '@nestjs/common';
import {
  MerchantOrderPayTypeEnum,
  MerchantUserBalanceLogEntity,
  MerchantUserEntity,
} from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import {
  MerchantUserBalanceListDTO,
  MerchantUserBalanceModifyDTO,
} from './balance.dto';
import { MerchantUserService } from '@app/merchant/user/user.service';
import { MEELUO_SHOP_DATABASE } from '@core/constant';

@Injectable()
export class MerchantUserBalanceService extends BaseService {
  constructor(
    @Inject(MerchantUserService)
    private merchantUserService: MerchantUserService,
    @InjectService(MerchantUserEntity)
    private userEntityService: OrmService<MerchantUserEntity>,
    @InjectService(MerchantUserBalanceLogEntity)
    private userBalanceLogEntityService: OrmService<
      MerchantUserBalanceLogEntity
    >,
  ) {
    super();
  }

  /**
   * 获取余额明细
   * @param query
   * @param merchantId
   */
  async log(
    {
      startTime,
      endTime,
      scene,
      type,
      nickname,
      userId,
      pageSize,
      pageIndex,
    }: MerchantUserBalanceListDTO,
    merchantId: number,
  ) {
    let users: MerchantUserEntity[];
    const condition: FindConditions<MerchantUserBalanceLogEntity> & {
      [key: string]: any;
    } = {
      type,
      scene,
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
    const balanceLogs = await this.userBalanceLogEntityService.findAndCount({
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

  /**
   * 修改用户余额
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async modifyBalance(
    { userId, money, type, scene, remark }: MerchantUserBalanceModifyDTO,
    merchantId: number,
    staffName: string,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserBalanceLogEntity)
    userBalanceLogRepo?: Repository<MerchantUserBalanceLogEntity>,
  ) {
    return this.merchantUserService.modifyUserBalance(
      userId,
      merchantId,
      money,
      type,
      scene,
      MerchantOrderPayTypeEnum.BALANCE,
      `后台管理员 [${staffName}] 操作`,
      remark,
      { userRepo, userBalanceLogRepo },
    );
  }
}
