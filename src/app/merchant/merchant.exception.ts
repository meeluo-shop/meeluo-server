import { ApiException } from '@jiaxinjiang/nest-exception';

export class GetMerchantDetailException extends ApiException {
  readonly code: number = 302001;
  readonly msg: string = '获取商户详情失败，请刷新页面后重试';
}

export class UpdateMerchantFailedException extends ApiException {
  readonly code: number = 302002;
  readonly msg: string = '修改商户信息失败，请刷新页面后重试';
}

export class MerchantGetQRCodeException extends ApiException {
  readonly code: number = 302003;
  readonly msg: string = '获取商户公众号二维码失败, 请刷新页面后重试';
}
