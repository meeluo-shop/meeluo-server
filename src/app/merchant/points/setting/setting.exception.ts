import { ApiException } from '@jiaxinjiang/nest-exception';

export class GetMerchantPointsSettingFailedException extends ApiException {
  readonly code: number = 310101;
  readonly msg: string = '获取积分设置失败，请刷新页面后重新再试';
}

export class SetMerchantPointsSettingFailedException extends ApiException {
  readonly code: number = 310102;
  readonly msg: string = '更新积分设置失败，请刷新页面后重新再试';
}
