import { Injectable, Inject } from '@nestjs/common';
import { File } from 'fastify-multer/lib/interfaces';
import { SettingKeyEnum, SettingService } from '@app/common/setting';
import {
  WechatOfficialAccountSettingDTO,
  WechatPaymentSettingDTO,
} from './setting.dto';
import { InjectService } from '@jiaxinjiang/nest-orm/dist';
import { WechatPaymentCertEntity } from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { CommonTerminalEnum } from '../../common.enum';
import { CommonService } from '../../common.service';

@Injectable()
export class WechatSettingService {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(SettingService)
    public settingService: SettingService,
    @InjectService(WechatPaymentCertEntity)
    private certEntityService: OrmService<WechatPaymentCertEntity>,
  ) {}

  /**
   * 获取微信公众号设置
   */
  async getOfficialAccount(target: CommonTerminalEnum, id: number) {
    return this.settingService.getSetting(
      target,
      id,
      SettingKeyEnum.WECHAT_OFFICIAL_ACCOUNT,
      WechatOfficialAccountSettingDTO,
    );
  }

  /**
   * 更新微信公众号设置
   * @param data
   * @param identity
   */
  async setOfficialAccount({
    data,
    target,
    id,
    userId,
  }: {
    data: WechatOfficialAccountSettingDTO;
    target: CommonTerminalEnum;
    id: number;
    userId: number;
  }) {
    const setting = await this.settingService.setSetting({
      target,
      id,
      userId,
      code: SettingKeyEnum.WECHAT_OFFICIAL_ACCOUNT,
      data,
    });
    return setting;
  }

  /**
   * 获取微信支付商户设置
   */
  async getPayment(target: CommonTerminalEnum, id: number) {
    return this.settingService.getSetting(
      target,
      id,
      SettingKeyEnum.WECHAT_PAY,
      WechatPaymentSettingDTO,
    );
  }

  /**
   * 更新微信支付商户设置
   * @param data
   * @param identity
   */
  async setPayment({
    data,
    target,
    id,
    userId,
  }: {
    data: WechatPaymentSettingDTO;
    target: CommonTerminalEnum;
    id: number;
    userId: number;
  }) {
    return this.settingService.setSetting({
      target,
      id,
      userId,
      code: SettingKeyEnum.WECHAT_PAY,
      data,
    });
  }

  /**
   * 上传微信支付证书
   * @param file
   * @param param1
   */
  async uploadPaymentCert({
    file,
    target,
    id,
    userId,
  }: {
    file: File;
    target: CommonTerminalEnum;
    id: number;
    userId: number;
  }) {
    const condition = this.commonService.getTerminalCondition(target, id);
    await this.certEntityService.upsert(
      {
        ...condition,
        fileName: file.originalname,
        content: file.buffer.toString('base64'),
      },
      condition,
      userId,
    );
    return true;
  }

  /**
   * 获取微信支付证书
   * @param merchantId
   */
  async getPaymentCert(target: CommonTerminalEnum, id: number) {
    const condition = this.commonService.getTerminalCondition(target, id);
    return this.certEntityService.findOne({
      where: condition,
    });
  }
}
