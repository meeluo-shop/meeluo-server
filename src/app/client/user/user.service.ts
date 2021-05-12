import { BaseService } from '@app/app.service';
import { MerchantTableService } from '@app/merchant/table';
import {
  MerchantUserGradeService,
  MerchantUserService,
} from '@app/merchant/user';
import { CodeService, CodeVerifyException } from '@app/common/code';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  InjectService,
  Not,
  Repository,
  Transaction,
  TransactionRepository,
} from '@jiaxinjiang/nest-orm';
import { Inject, Injectable } from '@nestjs/common';
import { CryptoHelperProvider } from '@shared/helper';
import {
  MerchantUserEntity,
  MerchantGameWinningEntity,
  MerchantOrderEntity,
  MerchantGameWinningStatusEnum,
  MerchantOrderPayStatusEnum,
  MerchantOrderStatusEnum,
  MerchantMenuOrderEntity,
  MerchantUserBalanceLogEntity,
  MerchantUserBalanceModifyTypeEnum,
  MerchantUserBalanceLogSceneEnum,
  MerchantOrderPayTypeEnum,
} from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import {
  ClientUserOrderCountDTO,
  ClientUserSubtractBalanceDTO,
} from './user.dto';

@Injectable()
export class ClientUserService extends BaseService {
  constructor(
    @Inject(CodeService)
    private codeService: CodeService,
    @Inject(MerchantUserService)
    public merchantUserService: MerchantUserService,
    @Inject(MerchantTableService)
    private merchantTableService: MerchantTableService,
    @Inject(MerchantUserGradeService)
    private merchantGradeService: MerchantUserGradeService,
    @InjectService(MerchantOrderEntity)
    private orderEntityService: OrmService<MerchantOrderEntity>,
    @InjectService(MerchantMenuOrderEntity)
    private menuOrderEntityService: OrmService<MerchantMenuOrderEntity>,
    @InjectService(MerchantGameWinningEntity)
    private gameWinningEntityService: OrmService<MerchantGameWinningEntity>,
    @InjectService(MerchantUserEntity)
    private merchantUserEntityService: OrmService<MerchantUserEntity>,
  ) {
    super();
  }

  /**
   * 获取用户信息
   * @param userId
   * @param merchantId
   */
  async getUserInfo(userId: number, merchantId: number) {
    const merchantUser = await this.merchantUserEntityService.findOne({
      where: { id: userId, merchantId },
    });
    await Promise.all([
      this.merchantGradeService.bindUsersGrade(merchantUser, merchantId),
      this.merchantUserService.bindWechatUser(
        merchantUser,
        'wechatUser',
        'openid',
      ),
    ]);
    return merchantUser;
  }

  /**
   * 获取用户昵称和头像
   * @param id
   */
  async getUserBaseInfo(id: number) {
    return this.merchantUserEntityService.findById(id, {
      select: ['nickname', 'avatar', 'balance'],
    });
  }

  /**
   * 获取用户订单数量
   * @param userId
   * @param merchantId
   */
  async getUserOrderCount(
    userId: number,
    merchantId: number,
  ): Promise<ClientUserOrderCountDTO> {
    const [
      noReceivedWinningCount,
      goodsOrderCount,
      foodsOrderCount,
      noPaidOrderCount,
      noPaidMenuOrderCount,
    ] = await Promise.all([
      // 获取待领取的获奖记录数量
      this.gameWinningEntityService.count({
        merchantUserId: userId,
        merchantId,
        status: MerchantGameWinningStatusEnum.NO_RECEIVED,
      }),
      // 获取用户商城订单总数量
      this.orderEntityService.count({
        merchantUserId: userId,
        merchantId,
      }),
      // 获取用户点餐订单总数量
      this.menuOrderEntityService.count({
        merchantUserId: userId,
        merchantId,
      }),
      // 获取用户待付款的商城订单数量
      this.orderEntityService.count({
        merchantUserId: userId,
        merchantId,
        payStatus: MerchantOrderPayStatusEnum.NOT_PAID,
        orderStatus: MerchantOrderStatusEnum.IN_PROCESS,
      }),
      // 获取用户待付款的点餐订单数量
      this.menuOrderEntityService.count({
        merchantUserId: userId,
        merchantId,
        payStatus: Not(MerchantOrderPayStatusEnum.PAID),
        orderStatus: MerchantOrderStatusEnum.IN_PROCESS,
      }),
    ]);
    return {
      noReceivedWinningCount,
      allOrderCount: foodsOrderCount + goodsOrderCount,
      noPaidOrderCount,
      noPaidMenuOrderCount,
    };
  }

  /**
   * 获取当前用户扫码的餐桌信息
   * @param param0
   */
  async getScanTable({ merchantId, openid }: ClientIdentity) {
    const tableId = await this.merchantTableService.getScanTableId({
      merchantId,
      openid,
    });
    if (!tableId) {
      return null;
    }
    return this.merchantTableService.detail(tableId, merchantId);
  }

  /**
   * 扣除用户余额
   * @param param0
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async subtractBalance(
    { encryptedId, amount }: ClientUserSubtractBalanceDTO,
    { merchantId }: ClientIdentity,
    @TransactionRepository(MerchantUserEntity)
    userRepo?: Repository<MerchantUserEntity>,
    @TransactionRepository(MerchantUserBalanceLogEntity)
    userBalanceLogRepo?: Repository<MerchantUserBalanceLogEntity>,
  ) {
    const decryptedId = CryptoHelperProvider.base64Decode(encryptedId);
    return this.merchantUserService.modifyUserBalance(
      Number(decryptedId),
      merchantId,
      amount,
      MerchantUserBalanceModifyTypeEnum.SUBTRACT,
      MerchantUserBalanceLogSceneEnum.QRCODE_CONSUME,
      MerchantOrderPayTypeEnum.BALANCE,
      `商家扫码扣款`,
      '',
      { userRepo, userBalanceLogRepo },
    );
  }

  /**
   * 用户绑定手机
   * @param param0
   */
  async bindPhone({
    userId,
    phone,
    code,
    merchantId,
  }: {
    userId: number;
    phone: string;
    code: string;
    merchantId: number;
  }) {
    const isPass = await this.codeService.verifySMSCode(phone, code);
    if (!isPass) {
      throw new CodeVerifyException();
    }
    // 将解绑手机号之前的账户
    await this.merchantUserEntityService.updateOne(
      {
        phone: null,
      },
      {
        merchantId,
        phone,
      },
      userId,
    );
    // 绑定到当前账户
    await this.merchantUserEntityService.updateById(
      {
        phone,
      },
      userId,
      userId,
    );
    return true;
  }
}
