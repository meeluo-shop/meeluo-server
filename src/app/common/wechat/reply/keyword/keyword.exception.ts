import { ApiException } from '@jiaxinjiang/nest-exception';

export class WechatAddKeywordException extends ApiException {
  readonly code: number = 906101;
  readonly msg: string = '添加关键词回复失败';
}

export class WechatGetKeywordException extends ApiException {
  readonly code: number = 906102;
  readonly msg: string = '查看关键词回复失败';
}

export class WechatUpdateKeywordException extends ApiException {
  readonly code: number = 906103;
  readonly msg: string = '修改关键词回复失败';
}

export class WechatDeleteKeywordException extends ApiException {
  readonly code: number = 906104;
  readonly msg: string = '删除关键词回复失败';
}

export class WechatGetKeywordListException extends ApiException {
  readonly code: number = 906105;
  readonly msg: string = '获取关键词回复失败';
}
