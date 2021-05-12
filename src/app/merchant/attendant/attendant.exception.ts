import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantAttendantGetException extends ApiException {
  readonly code: number = 324001;
  readonly msg: string = '获取客服信息失败';
}

export class MerchantAttendantSetException extends ApiException {
  readonly code: number = 324002;
  readonly msg: string = '设置客服信息失败';
}
