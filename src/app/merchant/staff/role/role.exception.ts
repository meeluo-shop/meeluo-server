import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantGetRolesFailedException extends ApiException {
  readonly code: number = 316001;
  readonly msg: string = '获取角色列表失败，请刷新页面后重试';
}

export class MerchantGetRoleDetailFailedException extends ApiException {
  readonly code: number = 316002;
  readonly msg: string = '获取角色详情失败，请刷新页面后重试';
}

export class MerchantDeleteRoleFailedException extends ApiException {
  readonly code: number = 316003;
  readonly msg: string = '删除角色失败，请刷新页面后重试';
}

export class MerchantCreateRoleFailedException extends ApiException {
  readonly code: number = 316004;
  readonly msg: string = '新增角色失败，请刷新页面后重试';
}

export class MerchantUpdateRoleFailedException extends ApiException {
  readonly code: number = 316005;
  readonly msg: string = '修改角色失败，请刷新页面后重试';
}

export class MerchantCodeExistsException extends ApiException {
  readonly code: number = 316006;
  readonly msg: string = '角色编号已存在';
}

export class MerchantMenusExistsException extends ApiException {
  readonly code: number = 316007;
  readonly msg: string = '该角色下存在导航，请清空后再重新删除';
}

export class MerchantPermsExistsException extends ApiException {
  readonly code: number = 316008;
  readonly msg: string = '该角色下存在权限，请清空后再重新删除';
}

export class MerchantGetRoleMenusException extends ApiException {
  readonly code: number = 316009;
  readonly msg: string = '获取角色下导航列表失败，请刷新页面后重试';
}

export class MerchantGetRolePermsException extends ApiException {
  readonly code: number = 316010;
  readonly msg: string = '获取角色下权限列表失败，请刷新页面后重试';
}

export class MerchantRoleBindPermsException extends ApiException {
  readonly code: number = 316011;
  readonly msg: string = '绑定权限失败，请刷新页面后重试';
}

export class MerchantRoleBindMenusException extends ApiException {
  readonly code: number = 316012;
  readonly msg: string = '绑定导航失败，请刷新页面后重试';
}

export class MerchantStaffsExistsException extends ApiException {
  readonly code: number = 316013;
  readonly msg: string = '该角色下存在员工，请清空后再重新删除';
}
