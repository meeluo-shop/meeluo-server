import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientUserGetDetailException extends ApiException {
  readonly code: number = 406001;
  readonly msg: string = '获取用户详细信息失败';
}

export class ClientUserGetOrderCountException extends ApiException {
  readonly code: number = 406002;
  readonly msg: string = '获取用户订单数量失败';
}

export class ClientUserGetScanTableException extends ApiException {
  readonly code: number = 406005;
  readonly msg: string = '获取用户当前餐桌信息失败';
}

export class ClientUserSubtractBalanceException extends ApiException {
  readonly code: number = 406006;
  readonly msg: string = '用户扣款失败';
}

export class ClientUserSendPhoneCodeException extends ApiException {
  readonly code: number = 406007;
  readonly msg: string = '发送短信验证码失败';
}

export class ClientUserVerifyPhoneCodeException extends ApiException {
  readonly code: number = 406008;
  readonly msg: string = '验证短信验证码失败';
}
