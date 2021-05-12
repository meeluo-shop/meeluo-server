import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import { MerchantWechatService } from '@app/merchant/wechat/wechat.service';
import {
  ClientWechatJSSDKConfigParamsDTO,
  ClientWechatJSSDKIsDebugEnum,
} from './wechat.dto';

@Injectable()
export class ClientWechatService extends BaseService {
  constructor(
    @Inject(MerchantWechatService)
    private merchantWechatService: MerchantWechatService,
  ) {
    super();
  }

  async getJSSDKConfig({
    debug,
    jsApiList,
    openTagList,
    url,
    merchantId,
  }: ClientWechatJSSDKConfigParamsDTO) {
    const baseApplication = await this.merchantWechatService.getBaseApplication(
      merchantId,
    );
    return baseApplication.jssdk.buildConfig(
      jsApiList,
      debug === ClientWechatJSSDKIsDebugEnum.TRUE,
      false,
      false,
      openTagList || [],
      url,
    );
  }
}
