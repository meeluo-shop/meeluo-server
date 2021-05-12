import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantGetUsersFailedException extends ApiException {
  readonly code: number = 318001;
  readonly msg: string = '获取用户列表失败，请刷新页面后重试';
}

export class MerchantActiveUserException extends ApiException {
  readonly code: number = 318002;
  readonly msg: string = '启用/禁用用户状态失败，请刷新页面后重试';
}

export class MerchantUpdateUserException extends ApiException {
  readonly code: number = 318003;
  readonly msg: string = '修改用户信息失败，请刷新页面后重试';
}
