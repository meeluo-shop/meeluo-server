import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientGetGamePrizeSettingException extends ApiException {
  readonly code: number = 402101;
  readonly msg: string = '获取游戏奖品设置失败';
}
