import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientGamePlayGameException extends ApiException {
  readonly code: number = 402001;
  readonly msg: string = '参与活动游戏失败';
}

export class ClientGetGameListException extends ApiException {
  readonly code: number = 402002;
  readonly msg: string = '获取游戏列表失败';
}

export class ClientGameRunOutOfTimesException extends ApiException {
  readonly code: number = 402003;
  readonly msg: string = '免费参与次数已用完';
}

export class ClientGameGameOverException extends ApiException {
  readonly code: number = 402004;
  readonly msg: string = '保存游戏成绩异常';
}

export class ClientGameSaveScoreException extends ApiException {
  readonly code: number = 402005;
  readonly msg: string = '保存游戏成绩失败';
}

export class ClientGameGetDetailException extends ApiException {
  readonly code: number = 402006;
  readonly msg: string = '获取游戏详情失败';
}

export class ClientGameLeaveWordException extends ApiException {
  readonly code: number = 402007;
  readonly msg: string = '用户留言失败';
}

export class ClientGetGameRankingListException extends ApiException {
  readonly code: number = 402008;
  readonly msg: string = '获取游戏挑战记录排名失败';
}

export class ClientGetGameMaxRankingException extends ApiException {
  readonly code: number = 402009;
  readonly msg: string = '获取游戏最高挑战记录失败';
}

export class ClientGetGameCategoryListException extends ApiException {
  readonly code: number = 402010;
  readonly msg: string = '获取游戏分类列表失败';
}

export class ClientGamePaySessionException extends ApiException {
  readonly code: number = 402011;
  readonly msg: string = '十分抱歉，系统出现异常，请联系客服人员';
}

export class ClientGameBalancePayFailedException extends ApiException {
  readonly code: number = 402012;
  readonly msg: string = '余额支付失败，请联系客服人员';
}

export class ClientGameCheckSessionException extends ApiException {
  readonly code: number = 402013;
  readonly msg: string = '校验游戏会话失败';
}

export class ClientGameGetQRCodeException extends ApiException {
  readonly code: number = 402014;
  readonly msg: string = '获取微信公众号二维码失败';
}

export class ClientGameInviteRewardException extends ApiException {
  readonly code: number = 402015;
  readonly msg: string = '获取游戏邀请奖励失败';
}
