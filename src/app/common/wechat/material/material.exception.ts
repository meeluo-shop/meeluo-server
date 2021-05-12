import { ApiException } from '@jiaxinjiang/nest-exception';

export class WechatMaterialTypeException extends ApiException {
  readonly code: number = 907001;
  readonly msg: string = '微信素材类型错误';
}
