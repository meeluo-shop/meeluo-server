import { ApiException } from '@jiaxinjiang/nest-exception';

export class WechatQRCodeException extends ApiException {
  readonly code: number = 905401;
  readonly msg: string = '获取商户公众号二维码失败';
}
