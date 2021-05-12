import { ApiException } from '@jiaxinjiang/nest-exception';

export class GetSystemGameListFailedException extends ApiException {
  readonly code: number = 313001;
  readonly msg: string = '获取游戏列表失败，请刷新页面后重新再试';
}

export class GetSystemGameCategorysFailedException extends ApiException {
  readonly code: number = 313002;
  readonly msg: string = '获取游戏分类列表失败，请刷新页面后重新再试';
}

export class ActiveMerchantGameFailedException extends ApiException {
  readonly code: number = 313003;
  readonly msg: string = '启用游戏失败，请刷新页面后重新再试';
}

export class MerchantGetGameDetailFailedException extends ApiException {
  readonly code: number = 313004;
  readonly msg: string = '获取游戏详情失败，请刷新页面后重新再试';
}

export class MerchantUpdateGameFailedException extends ApiException {
  readonly code: number = 313005;
  readonly msg: string = '更新游戏信息失败，请刷新页面后重新再试';
}

export class MerchantGameNameRepeatException extends ApiException {
  readonly code: number = 313006;
  readonly msg: string = '当前游戏名称已存在，请更换名称';
}

export class MerchantGameSetSessionException extends ApiException {
  readonly code: number = 313007;
  readonly msg: string = '生成游戏会话失败';
}

export class MerchantGameInviteListException extends ApiException {
  readonly code: number = 313008;
  readonly msg: string = '获取游戏好友邀请记录失败';
}

export class MerchantGameOrderListException extends ApiException {
  readonly code: number = 313009;
  readonly msg: string = '获取游戏付费订单列表失败';
}
