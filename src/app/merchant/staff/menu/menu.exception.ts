import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantGetMenusFailedException extends ApiException {
  readonly code: number = 315001;
  readonly msg: string = '获取导航列表失败，请刷新页面后重试';
}

export class MerchantGetMenuDetailFailedException extends ApiException {
  readonly code: number = 315002;
  readonly msg: string = '获取导航详情失败，请刷新页面后重试';
}

export class MerchantDeleteMenuFailedException extends ApiException {
  readonly code: number = 315003;
  readonly msg: string = '删除导航失败，请刷新页面后重试';
}

export class MerchantCreateMenuFailedException extends ApiException {
  readonly code: number = 315004;
  readonly msg: string = '新增导航失败，请刷新页面后重试';
}

export class MerchantUpdateMenuFailedException extends ApiException {
  readonly code: number = 315005;
  readonly msg: string = '修改导航失败，请刷新页面后重试';
}

export class MerchantCodeExistsException extends ApiException {
  readonly code: number = 315006;
  readonly msg: string = '导航编号已存在';
}
