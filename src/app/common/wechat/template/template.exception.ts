import { ApiException } from '@jiaxinjiang/nest-exception';

export class WechatGetIndustryException extends ApiException {
  readonly code: number = 905201;
  readonly msg: string = '获取微信公众号行业类目失败';
}

export class WechatSetIndustryException extends ApiException {
  readonly code: number = 905202;
  readonly msg: string = '设置微信公众号行业类目失败';
}

export class WechatSetTemplateMessageException extends ApiException {
  readonly code: number = 905203;
  readonly msg: string = '设置微信公众号模板消息失败';
}

export class WechatGetTemplateMessageException extends ApiException {
  readonly code: number = 905204;
  readonly msg: string = '获取微信公众号模板消息失败';
}

export class WechatDelTemplateMessageException extends ApiException {
  readonly code: number = 905205;
  readonly msg: string = '删除微信公众号模板消息失败';
}
