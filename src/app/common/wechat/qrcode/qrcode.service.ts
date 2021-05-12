import * as QS from 'querystring';
import BaseApplication from '@library/easyWechat/BaseService/Application';
import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import { QRCodeResp } from '@library/easyWechat/BaseService/Qrcode/QrcodeClient';
import { InjectService } from '@jiaxinjiang/nest-orm';
import { WechatQRCodeEntity } from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { QRCodeSceneValue } from './qrcode.interface';
import { CommonTerminalEnum } from '@app/common/common.enum';
import { CommonService } from '@app/common/common.service';

@Injectable()
export class WechatQRCodeService extends BaseService {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @InjectService(WechatQRCodeEntity)
    private qrcodeEntityService: OrmService<WechatQRCodeEntity>,
  ) {
    super();
  }

  async getQRCode({
    target,
    id,
    sceneValue,
    expireSeconds = 0,
    baseApplication,
    userId,
  }: {
    target: CommonTerminalEnum;
    id: number;
    sceneValue: QRCodeSceneValue;
    expireSeconds?: number;
    baseApplication: BaseApplication;
    userId: number;
  }) {
    const value = QS.stringify(sceneValue);
    let qrcodeResp: QRCodeResp;
    // 判断有效期在30天内
    if (expireSeconds > 0 && expireSeconds < 2592000) {
      qrcodeResp = await baseApplication.qrcode.temporary(value, expireSeconds);
    }
    qrcodeResp = await baseApplication.qrcode.forever(value);
    const condition = this.commonService.getTerminalCondition(target, id);
    return this.qrcodeEntityService.create(
      {
        ...condition,
        appid: baseApplication.config.appid,
        url: qrcodeResp.url,
        expireSeconds: qrcodeResp.expireSeconds,
        ticket: qrcodeResp.ticket,
      },
      userId,
    );
  }
}
