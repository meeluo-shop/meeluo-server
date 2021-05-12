import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientWechatGetJSSDKConfigException extends ApiException {
  readonly code: number = 413001;
  readonly msg: string = '获取微信jssdk配置失败';
}
