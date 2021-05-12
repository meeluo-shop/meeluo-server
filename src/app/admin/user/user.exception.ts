import { ApiException } from '@jiaxinjiang/nest-exception';

export class AdminCreateUserFailedException extends ApiException {
  readonly code: number = 106001;
  readonly msg: string = '新增用户失败，请刷新页面后重试';
}

export class AdminUsernameRepeatException extends ApiException {
  readonly code: number = 106002;
  readonly msg: string = '用户名已存在';
}

export class AdminUpdateUserFailedException extends ApiException {
  readonly code: number = 106003;
  readonly msg: string = '修改用户失败，请刷新页面后重试';
}

export class AdminUserNoExistentException extends ApiException {
  readonly code: number = 106004;
  readonly msg: string = '用户不存在';
}

export class AdminGetUsersFailedException extends ApiException {
  readonly code: number = 106005;
  readonly msg: string = '获取用户列表失败，请刷新页面后重试';
}

export class AdminGetUserDetailFailedException extends ApiException {
  readonly code: number = 106006;
  readonly msg: string = '获取用户详情失败，请刷新页面后重试';
}

export class AdminDeleteUserFailedException extends ApiException {
  readonly code: number = 106007;
  readonly msg: string = '删除用户失败，请刷新页面后重试';
}

export class AdminActiveUserDetailException extends ApiException {
  readonly code: number = 106008;
  readonly msg: string = '更新管理员状态失败，请刷新页面后重试';
}

export class AdminUpdateUserNotAllowException extends ApiException {
  readonly code: number = 106009;
  readonly msg: string = '无权更新超级管理员';
}
