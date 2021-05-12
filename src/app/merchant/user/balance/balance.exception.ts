import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantUserBalanceLogListException extends ApiException {
  readonly code: number = 323001;
  readonly msg: string = '获取用户余额明细列表失败';
}

export class MerchantUserBalanceModifyException extends ApiException {
  readonly code: number = 323002;
  readonly msg: string = '操作用户余额失败';
}
