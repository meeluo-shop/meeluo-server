import {
  UnauthorizedException,
  ApiException,
  ForbiddenException,
} from '@jiaxinjiang/nest-exception';

export class AdminInvalidUserException extends ApiException {
  readonly code: number = 102001;
  readonly msg: string = '账号或密码不正确';
}

export class AdminUserDisabledException extends ApiException {
  readonly code: number = 102002;
  readonly msg: string = '该账号已被禁用';
}

export class AdminLoginFailedException extends ApiException {
  readonly code: number = 102003;
  readonly msg: string = '用户登陆失败，请重新登陆';
}

export class AdminRoleHasNoPermException extends ForbiddenException {
  readonly code: number = 102004;
  readonly msg: string = '该用户角色无权限访问';
}

export class AdminIllegalRequestException extends UnauthorizedException {
  readonly code: number = 102005;
  readonly msg: string = '非法请求，请重新登陆';
}

export class AdminAuthExpiredException extends UnauthorizedException {
  readonly code: number = 102006;
  readonly msg: string = '身份认证已过期，请重新登录';
}

export class AdminLandingElsewhereException extends UnauthorizedException {
  readonly code: number = 102007;
  readonly msg: string = '账号已在其他地方登陆，请重新登录';
}

export class AdminAuthFailedException extends UnauthorizedException {
  readonly code: number = 102008;
  readonly msg: string = '身份认证失败，请重新登录';
}

export class AdminRefreshFailedException extends ApiException {
  readonly code: number = 102009;
  readonly msg: string = '更新用户登陆信息失败，请重新登陆';
}
