import { ApiException } from '@jiaxinjiang/nest-exception';

export class GetMerchantOrderSettingFailedException extends ApiException {
  readonly code: number = 323001;
  readonly msg: string = '获取订单设置失败，请刷新页面后重新再试';
}

export class SetMerchantOrderSettingFailedException extends ApiException {
  readonly code: number = 323002;
  readonly msg: string = '更新订单设置失败，请刷新页面后重新再试';
}
