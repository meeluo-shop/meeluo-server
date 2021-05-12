import { ApiException } from '@jiaxinjiang/nest-exception';

export class WechatGetReplyScanCodeException extends ApiException {
  readonly code: number = 906301;
  readonly msg: string = '获取公众号扫码回复失败';
}

export class WechatModifyReplyScanCodeException extends ApiException {
  readonly code: number = 906302;
  readonly msg: string = '更新公众号扫码回复失败';
}
