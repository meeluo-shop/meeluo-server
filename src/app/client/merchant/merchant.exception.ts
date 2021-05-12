import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientMerchantDetailException extends ApiException {
  readonly code: number = 403001;
  readonly msg: string = '获取商户详情信息失败';
}
