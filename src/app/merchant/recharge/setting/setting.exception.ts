import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantRechargeGettingException extends ApiException {
  readonly code: number = 304001;
  readonly msg: string = '获取用户充值设置失败';
}

export class MerchantRechargeSettingException extends ApiException {
  readonly code: number = 304002;
  readonly msg: string = '修改用户充值设置失败';
}
