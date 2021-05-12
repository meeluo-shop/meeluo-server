import { ApiException } from '@jiaxinjiang/nest-exception';

export class WechatMaterialAddImageException extends ApiException {
  readonly code: number = 907301;
  readonly msg: string = '添加图片素材失败';
}

export class WechatMaterialGetImageException extends ApiException {
  readonly code: number = 907302;
  readonly msg: string = '查看图片素材失败';
}

export class WechatMaterialUpdateImageException extends ApiException {
  readonly code: number = 907303;
  readonly msg: string = '修改图片素材失败';
}

export class WechatMaterialDeleteImageException extends ApiException {
  readonly code: number = 907304;
  readonly msg: string = '删除图片素材失败';
}

export class WechatMaterialGetImageListException extends ApiException {
  readonly code: number = 907305;
  readonly msg: string = '获取图片素材失败';
}
