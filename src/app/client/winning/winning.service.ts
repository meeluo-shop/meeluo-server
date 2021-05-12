import { BaseService } from '@app/app.service';
import { In, InjectService } from '@jiaxinjiang/nest-orm/dist';
import { Injectable, Inject } from '@nestjs/common';
import {
  MerchantGameWinningEntity,
  MerchantGameWinningGoodsEntity,
  MerchantGameWinningAddressEntity,
  MerchantGoodsPrizeGetMethodsEnum,
  MerchantGameWinningStatusEnum,
  MerchantUserEntity,
  AdminGameEntity,
} from '@typeorm/meeluoShop';
import { RegionService } from '@app/common/region/region.service';
import { OrmService } from '@typeorm/orm.service';
import { ClientWinningRemindDeliveryParamDTO } from './winning.dto';
import { ClientWinningInvaildPrizeOrderException } from './winning.exception';
import {
  MerchantWinningService,
  MerchantWinningListParamsDTO,
} from '@app/merchant/winning';
import { MerchantWechatTemplateService } from '@app/merchant/wechat/template';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';

@Injectable()
export class ClientWinningService extends BaseService {
  constructor(
    @InjectLogger(ClientWinningService)
    private logger: LoggerProvider,
    @Inject(RegionService)
    private regionService: RegionService,
    @Inject(MerchantWinningService)
    private merchantWinningService: MerchantWinningService,
    @Inject(MerchantWechatTemplateService)
    private wechatTemplateService: MerchantWechatTemplateService,
    @InjectService(MerchantUserEntity)
    private userEntityService: OrmService<MerchantUserEntity>,
    @InjectService(AdminGameEntity)
    private adminGameEntityService: OrmService<AdminGameEntity>,
    @InjectService(MerchantGameWinningEntity)
    private winningEntityService: OrmService<MerchantGameWinningEntity>,
    @InjectService(MerchantGameWinningGoodsEntity)
    private winningGoodsEntityService: OrmService<
      MerchantGameWinningGoodsEntity
    >,
    @InjectService(MerchantGameWinningAddressEntity)
    private winningAddressEntityService: OrmService<
      MerchantGameWinningAddressEntity
    >,
  ) {
    super();
  }

  /**
   * 获取获奖记录列表
   * @param query
   * @param merchantId
   */
  async list(
    query: MerchantWinningListParamsDTO,
    { merchantId, userId }: ClientIdentity,
  ) {
    return this.merchantWinningService.list({ ...query, userId }, merchantId);
  }

  /**
   * 获取获奖记录详情
   * @param id
   * @param identity
   */
  async detail(id: number, merchantId: number, userId?: number) {
    return this.merchantWinningService.detail(id, merchantId, userId);
  }

  /**
   * 奖品确认收货
   * @param id
   * @param identity
   */
  async confirmReceipt(id: number, { merchantId, userId }: ClientIdentity) {
    return this.merchantWinningService.confirmReceipt(id, merchantId, userId);
  }

  /**
   * 员工核销奖品
   * @param id 
   * @param param1 
   */
  async deliverPrize(id: number, { staffId, merchantId }: ClientIdentity) {
    return this.merchantWinningService.deliverPrize({
      staffId,
      winningId: id,
    }, staffId, merchantId,)
  }

  /**
   * 给获奖记录绑定收货地址
   * @param entitys
   */
  async bindWinningAddress(
    entitys: MerchantGameWinningEntity,
    withRegionName: boolean,
  ): Promise<MerchantGameWinningEntity>;
  async bindWinningAddress(
    entitys: MerchantGameWinningEntity[],
    withRegionName: boolean,
  ): Promise<MerchantGameWinningEntity[]>;
  async bindWinningAddress(
    entitys: MerchantGameWinningEntity | MerchantGameWinningEntity[],
    withRegionName = false,
  ) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const winningIds = Array.from(new Set(targets.map(item => item.id)));
    const addressList = await this.winningAddressEntityService.find({
      where: { winningId: In(winningIds.length ? winningIds : [null]) },
    });
    const regionCodes: number[] = [];
    targets.forEach(target => {
      target.winningAddress =
        addressList.find(item => item.winningId === target.id) || null;
      if (withRegionName && target.winningAddress) {
        const { provinceCode, countyCode, cityCode } = target.winningAddress;
        regionCodes.push(provinceCode, cityCode, countyCode);
      }
    });
    if (regionCodes.length) {
      // 获取省份、城市、乡镇名称
      const regionData = this.regionService.getRegionNameByCodes(regionCodes);
      targets.forEach(target => {
        if (!target.winningAddress) {
          return;
        }
        const { provinceCode, countyCode, cityCode } = target.winningAddress;
        target.winningAddress.provinceName = regionData[provinceCode];
        target.winningAddress.cityName = regionData[cityCode];
        target.winningAddress.countyName = regionData[countyCode];
      });
    }
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 给获奖记录绑定奖品信息
   * @param entitys
   */
  async bindWinningGoods(
    entitys: MerchantGameWinningEntity,
  ): Promise<MerchantGameWinningEntity>;
  async bindWinningGoods(
    entitys: MerchantGameWinningEntity[],
  ): Promise<MerchantGameWinningEntity[]>;
  async bindWinningGoods(
    entitys: MerchantGameWinningEntity | MerchantGameWinningEntity[],
  ) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const winningIds = Array.from(new Set(targets.map(item => item.id)));
    const winningGoods = await this.winningGoodsEntityService.find({
      where: { winningId: In(winningIds.length ? winningIds : [null]) },
    });
    targets.forEach(target => {
      target.winningGoods =
        winningGoods.find(item => item.winningId === target.id) || null;
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 提醒商家发货
   * @param id
   * @param query
   * @param identity
   */
  async remindDelivery(
    id: number,
    query: ClientWinningRemindDeliveryParamDTO,
    identity: ClientIdentity,
  ) {
    const { merchantId, userId } = identity;
    const [winning, winningGoods] = await Promise.all([
      this.winningEntityService.findOne({
        select: ['status', 'winningNo', 'adminGameId'],
        where: {
          id,
          merchantId,
          merchantUserId: userId,
        },
      }),
      this.winningGoodsEntityService.findOne({
        select: ['prizeGetMethods', 'name'],
        where: {
          winningId: id,
          merchantId,
        },
      }),
    ]);
    if (winning.status !== MerchantGameWinningStatusEnum.NO_RECEIVED) {
      return false;
    }
    if (
      !winningGoods ||
      winningGoods.prizeGetMethods !==
        MerchantGoodsPrizeGetMethodsEnum.DISTRIBUTION
    ) {
      throw new ClientWinningInvaildPrizeOrderException();
    }
    await this.winningAddressEntityService.create(
      {
        ...query,
        winningId: id,
        merchantId,
        merchantUserId: userId,
      },
      userId,
    );
    await this.winningEntityService.update(
      {
        status: MerchantGameWinningStatusEnum.NO_DELIVERED,
      },
      {
        id,
        merchantId,
        merchantUserId: userId,
      },
      userId,
    );
    // 给员工发送获奖通知
    await this.sendWinningMessage({
      winningNo: winning.winningNo,
      prizeName: winningGoods.name,
      adminGameId: winning.adminGameId,
      merchantId,
      userId,
    }).catch(err => this.logger.error(err))
    return true;
  }

  /**
   * 发送获奖通知
   * @param param0 
   */
  async sendWinningMessage({
    winningNo,
    prizeName,
    adminGameId,
    merchantId,
    userId,
  }: {
    prizeName: string;
    adminGameId: number;
    winningNo: string;
    merchantId: number;
    userId: number;
  }) {
    const [game, user] = await Promise.all([
      this.adminGameEntityService.findById(adminGameId, {
        select: ['name'],
      }),
      this.userEntityService.findById(userId, {
        select: ['nickname'],
      }),
    ])
    // 发送通知给商户员工
    await this.wechatTemplateService.sendWinningStaffNotice({
      winningNo,
      winningTime: new Date(),
      prizeName,
      gameName: game.name,
      username: user.nickname,
    }, merchantId)
  }
}
