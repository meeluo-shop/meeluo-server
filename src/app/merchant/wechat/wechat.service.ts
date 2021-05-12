import { BaseService } from '@app/app.service';
import { Inject, Injectable } from '@nestjs/common';
import {
  WechatBaseApplicationService,
  WechatOfficialAccountService,
  WechatPaymentService,
} from '@shared/wechat';
import { WechatSettingService } from '@app/common/wechat/setting/setting.service';
import { WechatPaymentSettingDTO } from '@app/common/wechat/setting/setting.dto';
import { WechatQRCodeService } from '@app/common/wechat/qrcode/qrcode.service';
import {
  MerchantAllowPrivateWechatEnum,
  MerchantEntity,
  WechatPaymentCertEntity,
  WechatQRCodeEntity,
} from '@typeorm/meeluoShop';
import WechatConfig from '@config/wechat.config';
import { CommonTerminalEnum } from '@app/common';
import { InjectService } from '@jiaxinjiang/nest-orm';
import { OrmService } from '@typeorm/orm.service';

@Injectable()
export class MerchantWechatService extends BaseService {
  constructor(
    @Inject(WechatSettingService)
    private wechatSettingService: WechatSettingService,
    @Inject(WechatQRCodeService)
    private wechatQRCodeService: WechatQRCodeService,
    @Inject(WechatPaymentService)
    private paymentService: WechatPaymentService,
    @Inject(WechatOfficialAccountService)
    private officialAccountService: WechatOfficialAccountService,
    @Inject(WechatBaseApplicationService)
    private baseApplicationService: WechatBaseApplicationService,
    @InjectService(MerchantEntity)
    private merchantEntityService: OrmService<MerchantEntity>,
    @InjectService(WechatQRCodeEntity)
    private qrcodeEntityService: OrmService<WechatQRCodeEntity>,
  ) {
    super();
  }

  /**
   * 获取商户微信公众号实例
   * @param merchantId
   * @param merchant
   */
  async getOfficialAccount(merchantId: number, merchant?: MerchantEntity) {
    const config = await this.getOfficialAccountConfig(merchantId, merchant);
    return this.officialAccountService.getAccount(config);
  }

  async getBaseApplication(merchantId: number, merchant?: MerchantEntity) {
    const config = await this.getOfficialAccountConfig(merchantId, merchant);
    return this.baseApplicationService.getAccount({
      appid: config.appId,
      secret: config.secret,
    });
  }

  /**
   * 获取微信支付操作实例
   * @param merchantId
   */
  async getPayment({
    merchantId,
    appId,
    paymentConfig,
    cert,
    merchant,
  }: {
    merchantId: number;
    appId?: string;
    cert?: Buffer;
    paymentConfig?: WechatPaymentSettingDTO;
    merchant?: MerchantEntity;
  }) {
    const getMerchant = async () =>
      this.merchantEntityService.findById(merchantId, {
        select: ['allowPrivateWechat', 'agentId'],
      });
    if (!appId) {
      if (!merchant) {
        merchant = await getMerchant();
      }
      const officialAccountConfig = await this.getOfficialAccountConfig(
        merchantId,
        merchant,
      );
      appId = officialAccountConfig.appId;
    }
    if (!paymentConfig) {
      if (!merchant) {
        merchant = await getMerchant();
      }
      paymentConfig = await this.getPaymentConfig(merchantId, merchant);
    }
    return this.paymentService.getAccount({
      cert,
      appid: appId,
      mchId: paymentConfig.mchId,
      key: paymentConfig.apiKey,
      notifyUrl: WechatConfig.paymentNotifyUrl,
    });
  }

  /**
   * 获取商户微信公众号配置
   * @param merchantId
   */
  async getOfficialAccountConfig(
    merchantId: number,
    merchant?: MerchantEntity,
  ) {
    if (!merchant) {
      merchant = await this.merchantEntityService.findById(merchantId, {
        select: ['allowPrivateWechat', 'agentId'],
      });
    }
    if (merchant?.allowPrivateWechat === MerchantAllowPrivateWechatEnum.FALSE) {
      return this.wechatSettingService.getOfficialAccount(
        CommonTerminalEnum.AGENT,
        merchant.agentId,
      );
    } else {
      return this.wechatSettingService.getOfficialAccount(
        CommonTerminalEnum.MERCHANT,
        merchantId,
      );
    }
  }

  /**
   * 或者商户微信支付配置
   * @param merchantId
   * @param merchant
   */
  async getPaymentConfig(merchantId: number, merchant?: MerchantEntity) {
    if (!merchant) {
      merchant = await this.merchantEntityService.findById(merchantId, {
        select: ['allowPrivateWechat', 'agentId'],
      });
    }
    if (merchant?.allowPrivateWechat === MerchantAllowPrivateWechatEnum.FALSE) {
      return this.wechatSettingService.getPayment(
        CommonTerminalEnum.AGENT,
        merchant.agentId,
      );
    } else {
      return this.wechatSettingService.getPayment(
        CommonTerminalEnum.MERCHANT,
        merchantId,
      );
    }
  }

  /**
   * 获取微信支付证书
   * @param merchantId
   */
  async getPaymentCert(merchantId: number, merchant?: MerchantEntity) {
    if (!merchant) {
      merchant = await this.merchantEntityService.findById(merchantId, {
        select: ['allowPrivateWechat', 'agentId'],
      });
    }
    let paymentCert: WechatPaymentCertEntity;
    if (merchant?.allowPrivateWechat === MerchantAllowPrivateWechatEnum.FALSE) {
      paymentCert = await this.wechatSettingService.getPaymentCert(
        CommonTerminalEnum.AGENT,
        merchant.agentId,
      );
    } else {
      paymentCert = await this.wechatSettingService.getPaymentCert(
        CommonTerminalEnum.MERCHANT,
        merchantId,
      );
    }
    if (!paymentCert?.content) {
      return null;
    }
    return Buffer.from(paymentCert.content, 'base64');
  }

  async getMerchantQRCode(merchantId: number, userId: number) {
    const merchant = await this.merchantEntityService.findById(merchantId, {
      select: ['qrcodeTicket', 'allowPrivateWechat', 'agentId'],
    });
    const config = await this.getOfficialAccountConfig(merchantId, merchant);
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
}
