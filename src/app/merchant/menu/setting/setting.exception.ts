import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantMenuOrderGettingException extends ApiException {
  readonly code: number = 326101;
  readonly msg: string = '获取订单设置失败，请刷新页面后重新再试';
}

export class MerchantMenuOrderSettingException extends ApiException {
  readonly code: number = 326102;
  readonly msg: string = '更新订单设置失败，请刷新页面后重新再试';
}

export class MerchantMenuPayTypeGettingException extends ApiException {
  readonly code: number = 326103;
  readonly msg: string = '获取点餐支付方式列表失败，请刷新页面后重新再试';
}

export class MerchantMenuPayTypeSettingException extends ApiException {
  readonly code: number = 326104;
  readonly msg: string = '更新点餐支付方式列表失败，请刷新页面后重新再试';
}
