import { ApiException } from '@jiaxinjiang/nest-exception';

export class WechatMaterialAddVideoException extends ApiException {
  readonly code: number = 907501;
  readonly msg: string = '添加视频素材失败';
}

export class WechatMaterialGetVideoException extends ApiException {
  readonly code: number = 907502;
  readonly msg: string = '查看视频素材失败';
}

export class WechatMaterialUpdateVideoException extends ApiException {
  readonly code: number = 907503;
  readonly msg: string = '修改视频素材失败';
}

export class WechatMaterialDeleteVideoException extends ApiException {
  readonly code: number = 907504;
  readonly msg: string = '删除视频素材失败';
}

export class WechatMaterialGetVideoListException extends ApiException {
  readonly code: number = 907505;
  readonly msg: string = '获取视频素材失败';
}
