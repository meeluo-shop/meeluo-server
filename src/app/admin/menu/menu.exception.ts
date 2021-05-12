import { ApiException } from '@jiaxinjiang/nest-exception';

export class AdminGetMenusFailedException extends ApiException {
  readonly code: number = 104001;
  readonly msg: string = '获取导航列表失败，请刷新页面后重试';
}

export class AdminGetMenuDetailFailedException extends ApiException {
  readonly code: number = 104002;
  readonly msg: string = '获取导航详情失败，请刷新页面后重试';
}

export class AdminDeleteMenuFailedException extends ApiException {
  readonly code: number = 104003;
  readonly msg: string = '删除导航失败，请刷新页面后重试';
}

export class AdminCreateMenuFailedException extends ApiException {
  readonly code: number = 104004;
  readonly msg: string = '新增导航失败，请刷新页面后重试';
}

export class AdminUpdateMenuFailedException extends ApiException {
  readonly code: number = 104005;
  readonly msg: string = '修改导航失败，请刷新页面后重试';
}

export class AdminCodeExistsException extends ApiException {
  readonly code: number = 104006;
  readonly msg: string = '导航编号已存在';
}
