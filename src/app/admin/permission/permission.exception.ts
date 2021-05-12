import { ApiException } from '@jiaxinjiang/nest-exception';

export class AdminGetPermsFailedException extends ApiException {
  readonly code: number = 103001;
  readonly msg: string = '获取数据权限列表失败，请刷新页面后重试';
}

export class AdminGetPermDetailFailedException extends ApiException {
  readonly code: number = 103002;
  readonly msg: string = '获取数据权限详情失败，请刷新页面后重试';
}

export class AdminDeletePermFailedException extends ApiException {
  readonly code: number = 103003;
  readonly msg: string = '删除数据权限失败，请刷新页面后重试';
}

export class AdminCreatePermFailedException extends ApiException {
  readonly code: number = 103004;
  readonly msg: string = '新增数据权限失败，请刷新页面后重试';
}

export class AdminUpdatePermFailedException extends ApiException {
  readonly code: number = 103005;
  readonly msg: string = '修改数据权限失败，请刷新页面后重试';
}

export class AdminCodeExistsException extends ApiException {
  readonly code: number = 103006;
  readonly msg: string = '权限编号已存在';
}
