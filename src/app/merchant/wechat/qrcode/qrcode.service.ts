import { BaseService } from '@app/app.service';
import { Inject, Injectable } from '@nestjs/common';
import { WechatBaseApplicationService } from '@shared/wechat';
import { WechatQRCodeService } from '@app/common/wechat/qrcode/qrcode.service';
import {
  MerchantAllowPrivateWechatEnum,
  MerchantEntity,
  MerchantGameEntity,
  MerchantTableEntity,
  WechatQRCodeEntity,
} from '@typeorm/meeluoShop';
import { CommonTerminalEnum } from '@app/common';
import { InjectService } from '@jiaxinjiang/nest-orm';
import { OrmService } from '@typeorm/orm.service';
import { MerchantWechatService } from '../wechat.service';

@Injectable()
export class MerchantWechatQRCodeService extends BaseService {
  constructor(
    @Inject(MerchantWechatService)
    private merchantWechatService: MerchantWechatService,
    @Inject(WechatQRCodeService)
    private wechatQRCodeService: WechatQRCodeService,
    @Inject(WechatBaseApplicationService)
    private baseApplicationService: WechatBaseApplicationService,
    @InjectService(MerchantEntity)
    private merchantEntityService: OrmService<MerchantEntity>,
    @InjectService(WechatQRCodeEntity)
    private qrcodeEntityService: OrmService<WechatQRCodeEntity>,
    @InjectService(MerchantTableEntity)
    private tableEntityService: OrmService<MerchantTableEntity>,
    @InjectService(MerchantGameEntity)
    private merchantGameEntityService: OrmService<MerchantGameEntity>,
  ) {
    super();
  }

  /**
   * 获取商户公众号二维码
   * @param merchantId
   * @param userId
   */
  async getMerchantQRCode(merchantId: number, userId: number) {
    const merchant = await this.merchantEntityService.findById(merchantId, {
      select: ['qrcodeTicket', 'allowPrivateWechat', 'agentId'],
    });
    const config = await this.merchantWechatService.getOfficialAccountConfig(
      merchantId,
      merchant,
    );
    if (!config.appId || !merchant) {
      return null;
    }
    const currentQrcode = await this.qrcodeEntityService.findOne({
      where: {
        ticket: merchant.qrcodeTicket,
        appid: config.appId,
      },
    });
    if (currentQrcode) {
      return currentQrcode;
    }
    const account = this.baseApplicationService.getAccount({
      appid: config.appId,
      secret: config.secret,
    });
    let target: CommonTerminalEnum = CommonTerminalEnum.MERCHANT;
    let terminalId: number = merchantId;
    if (merchant.allowPrivateWechat === MerchantAllowPrivateWechatEnum.FALSE) {
      target = CommonTerminalEnum.AGENT;
      terminalId = merchant.agentId;
    }
    const qrcode = await this.wechatQRCodeService.getQRCode({
      target,
      id: terminalId,
      sceneValue: { mchid: merchantId },
      userId,
      baseApplication: account,
    });
    await this.merchantEntityService.updateById(
      { qrcodeTicket: qrcode.ticket },
      merchantId,
      userId,
    );
    return qrcode;
  }

  /**
   * 获取餐桌公众号二维码
   */
  async getTableQRCode(tableId: number, merchantId: number, userId: number) {
    const [table, merchant] = await Promise.all([
      this.tableEntityService.findOne({
        select: ['qrcodeTicket'],
        where: {
          id: tableId,
          merchantId,
        },
      }),
      this.merchantEntityService.findById(merchantId, {
        select: ['allowPrivateWechat', 'agentId'],
      }),
    ]);
    const config = await this.merchantWechatService.getOfficialAccountConfig(
      merchantId,
      merchant,
    );
    if (!config.appId || !merchant || !table) {
      return null;
    }
    const currentQrcode = await this.qrcodeEntityService.findOne({
      where: {
        ticket: table.qrcodeTicket,
        appid: config.appId,
      },
    });
    if (currentQrcode) {
      return currentQrcode;
    }
    const account = this.baseApplicationService.getAccount({
      appid: config.appId,
      secret: config.secret,
    });
    let target: CommonTerminalEnum = CommonTerminalEnum.MERCHANT;
    let terminalId: number = merchantId;
    if (merchant.allowPrivateWechat === MerchantAllowPrivateWechatEnum.FALSE) {
      target = CommonTerminalEnum.AGENT;
      terminalId = merchant.agentId;
    }
    const qrcode = await this.wechatQRCodeService.getQRCode({
      target,
      id: terminalId,
      sceneValue: { tableid: tableId },
      userId,
      baseApplication: account,
    });
    await this.tableEntityService.updateById(
      { qrcodeTicket: qrcode.ticket },
      tableId,
      userId,
    );
    return qrcode;
  }

  /**
   * 获取游戏关注公众号二维码
   */
  async getGameQRCode(adminGameId: number, merchantId: number, userId: number) {
    const [gameInfo, merchant] = await Promise.all([
      this.merchantGameEntityService.findOne({
        select: ['qrcodeTicket'],
        where: {
          merchantId,
          adminGameId,
        },
      }),
      this.merchantEntityService.findById(merchantId, {
        select: ['allowPrivateWechat', 'agentId'],
      }),
    ]);
    const config = await this.merchantWechatService.getOfficialAccountConfig(
      merchantId,
      merchant,
    );
    if (!config.appId || !merchant || !gameInfo) {
      return null;
    }
    const currentQrcode = await this.qrcodeEntityService.findOne({
      where: {
        ticket: gameInfo.qrcodeTicket,
        appid: config.appId,
      },
    });
    if (currentQrcode) {
      return currentQrcode;
    }
    const account = await this.merchantWechatService.getBaseApplication(
      merchantId,
      merchant,
    );
    let target: CommonTerminalEnum = CommonTerminalEnum.MERCHANT;
    let terminalId: number = merchantId;
    if (merchant.allowPrivateWechat === MerchantAllowPrivateWechatEnum.FALSE) {
      target = CommonTerminalEnum.AGENT;
      terminalId = merchant.agentId;
    }
    const qrcode = await this.wechatQRCodeService.getQRCode({
      target,
      id: terminalId,
      sceneValue: { gameid: gameInfo.id },
      userId,
      baseApplication: account,
    });
    await this.merchantGameEntityService.update(
      { qrcodeTicket: qrcode.ticket },
      { merchantId, adminGameId },
      userId,
    );
    return qrcode;
  }
}
