import { ApiException } from '@jiaxinjiang/nest-exception';

export class GetMerchantDeliverySettingFailedException extends ApiException {
  readonly code: number = 309101;
  readonly msg: string = '获取运费设置失败，请刷新页面后重新再试';
}

export class SetMerchantDeliverySettingFailedException extends ApiException {
  readonly code: number = 309102;
  readonly msg: string = '更新运费设置失败，请刷新页面后重新再试';
}
