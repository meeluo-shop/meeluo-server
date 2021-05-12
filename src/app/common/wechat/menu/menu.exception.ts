import { ApiException } from '@jiaxinjiang/nest-exception';

export class WechatGetMenuException extends ApiException {
  readonly code: number = 905301;
  readonly msg: string = '获取公众号自定义菜单失败';
}

export class WechatSetMenuException extends ApiException {
  readonly code: number = 905302;
  readonly msg: string = '设置公众号自定义菜单失败';
}
