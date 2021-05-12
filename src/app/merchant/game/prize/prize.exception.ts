import { ApiException } from '@jiaxinjiang/nest-exception';

export class GetMerchantGamePrizeListException extends ApiException {
  readonly code: number = 313201;
  readonly msg: string = '获取游戏活动奖品列表失败，请刷新页面后重新再试';
}
