import { ApiException } from '@jiaxinjiang/nest-exception';

export class WechatMaterialAddTextException extends ApiException {
  readonly code: number = 907601;
  readonly msg: string = '添加图文素材失败';
}

export class WechatMaterialGetTextException extends ApiException {
  readonly code: number = 907602;
  readonly msg: string = '查看图文素材失败';
}

export class WechatMaterialUpdateTextException extends ApiException {
  readonly code: number = 907603;
  readonly msg: string = '修改图文素材失败';
}

export class WechatMaterialDeleteTextException extends ApiException {
  readonly code: number = 907604;
  readonly msg: string = '删除图文素材失败';
}

export class WechatMaterialGetTextListException extends ApiException {
  readonly code: number = 907605;
  readonly msg: string = '获取图文素材失败';
}
