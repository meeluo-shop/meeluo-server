import { BaseService } from '@app/app.service';
import { Injectable, Inject } from '@nestjs/common';
import { MerchantWechatService } from '@app/merchant/wechat/wechat.service';
import { MerchantService } from '@app/merchant/merchant.service';
import { ClientMerchantInfoRespDTO } from './merchant.dto';

@Injectable()
export class ClientMerchantService extends BaseService {
  constructor(
    @Inject(MerchantService)
    private merchantService: MerchantService,
    @Inject(MerchantWechatService)
    private merchantWechatService: MerchantWechatService,
  ) {
    super();
  }

  /**
   * 获取商户详情
   * @param param0
   */
  async detail(merchantId: number) {
    // 获取商户详情
    const merchantInfo = (await this.merchantService.detail(
      merchantId,
      false,
    )) as ClientMerchantInfoRespDTO;
    if (!merchantInfo) {
      return merchantInfo;
    }
    // 获取商户微信公众号配置
    const wechatConfig = await this.merchantWechatService.getOfficialAccountConfig(
      merchantId,
      merchantInfo,
    );
    merchantInfo.appId = wechatConfig.appId;
    merchantInfo.wechatId = wechatConfig.wechatId;
    return merchantInfo;
  }
}
