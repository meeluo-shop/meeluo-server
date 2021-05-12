import { ApiException } from '@jiaxinjiang/nest-exception';

export class AdminGetRolesFailedException extends ApiException {
  readonly code: number = 105001;
  readonly msg: string = '获取角色列表失败，请刷新页面后重试';
}

export class AdminGetRoleDetailFailedException extends ApiException {
  readonly code: number = 105002;
  readonly msg: string = '获取角色详情失败，请刷新页面后重试';
}

export class AdminDeleteRoleFailedException extends ApiException {
  readonly code: number = 105003;
  readonly msg: string = '删除角色失败，请刷新页面后重试';
}

export class AdminCreateRoleFailedException extends ApiException {
  readonly code: number = 105004;
  readonly msg: string = '新增角色失败，请刷新页面后重试';
}

export class AdminUpdateRoleFailedException extends ApiException {
  readonly code: number = 105005;
  readonly msg: string = '修改角色失败，请刷新页面后重试';
}

export class AdminCodeExistsException extends ApiException {
  readonly code: number = 105006;
  readonly msg: string = '角色编号已存在';
}

export class AdminMenusExistsException extends ApiException {
  readonly code: number = 105007;
  readonly msg: string = '该角色下存在导航，请清空后再重新删除';
}

export class AdminPermsExistsException extends ApiException {
  readonly code: number = 105008;
  readonly msg: string = '该角色下存在权限，请清空后再重新删除';
}

export class AdminGetRoleMenusException extends ApiException {
  readonly code: number = 105009;
  readonly msg: string = '获取角色下导航列表失败，请刷新页面后重试';
}

export class AdminGetRolePermsException extends ApiException {
  readonly code: number = 105010;
  readonly msg: string = '获取角色下权限列表失败，请刷新页面后重试';
}

export class AdminRoleBindPermsException extends ApiException {
  readonly code: number = 105011;
  readonly msg: string = '绑定权限失败，请刷新页面后重试';
}

export class AdminRoleBindMenusException extends ApiException {
  readonly code: number = 105012;
  readonly msg: string = '绑定导航失败，请刷新页面后重试';
}

export class AdminUsersExistsException extends ApiException {
  readonly code: number = 105013;
  readonly msg: string = '该角色下存在用户，请清空后再重新删除';
}
