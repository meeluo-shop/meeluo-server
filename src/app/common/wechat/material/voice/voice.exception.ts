import { ApiException } from '@jiaxinjiang/nest-exception';

export class WechatMaterialAddVoiceException extends ApiException {
  readonly code: number = 907401;
  readonly msg: string = '添加音频素材失败';
}

export class WechatMaterialGetVoiceException extends ApiException {
  readonly code: number = 907402;
  readonly msg: string = '查看音频素材失败';
}

export class WechatMaterialUpdateVoiceException extends ApiException {
  readonly code: number = 907403;
  readonly msg: string = '修改音频素材失败';
}

export class WechatMaterialDeleteVoiceException extends ApiException {
  readonly code: number = 907404;
  readonly msg: string = '删除音频素材失败';
}

export class WechatMaterialGetVoiceListException extends ApiException {
  readonly code: number = 907405;
  readonly msg: string = '获取音频素材失败';
}
