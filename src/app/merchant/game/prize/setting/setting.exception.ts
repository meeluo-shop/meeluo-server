import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantGetGamePrizeSettingException extends ApiException {
  readonly code: number = 313211;
  readonly msg: string = '获取游戏奖品设置失败';
}

export class MerchantSetGamePrizeSettingException extends ApiException {
  readonly code: number = 313212;
  readonly msg: string = '更新游戏奖品设置失败';
}
