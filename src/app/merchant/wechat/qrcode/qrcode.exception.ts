import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantWechatGetMerchantQRCodeException extends ApiException {
  readonly code: number = 309101;
  readonly msg: string = '获取商户公众号二维码失败, 请刷新页面后重试';
}

export class MerchantWechatGetTableQRCodeException extends ApiException {
  readonly code: number = 309102;
  readonly msg: string = '获取餐桌二维码失败, 请刷新页面后重试';
}
