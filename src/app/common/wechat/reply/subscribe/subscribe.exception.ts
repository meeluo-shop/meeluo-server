import { ApiException } from '@jiaxinjiang/nest-exception';

export class WechatGetReplySubscribeException extends ApiException {
  readonly code: number = 906201;
  readonly msg: string = '获取公众号关注回复失败';
}

export class WechatModifyReplySubscribeException extends ApiException {
  readonly code: number = 906202;
  readonly msg: string = '更新公众号关注回复失败';
}
