import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantPageGettingException extends ApiException {
  readonly code: number = 320101;
  readonly msg: string = '获取客户端页面设置失败';
}

export class MerchantPageSettingException extends ApiException {
  readonly code: number = 320102;
  readonly msg: string = '修改客户端页面设置失败';
}
