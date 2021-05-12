import {
  UnauthorizedException,
  ApiException,
} from '@jiaxinjiang/nest-exception';

export class MerchantInvalidUserException extends ApiException {
  readonly code: number = 301001;
  readonly msg: string = '账号或密码不正确';
}

export class MerchantUserDisabledException extends ApiException {
  readonly code: number = 301002;
  readonly msg: string = '该账号已被禁用';
}

export class MerchantLoginFailedException extends ApiException {
  readonly code: number = 301003;
  readonly msg: string = '用户登陆失败，请重新登陆';
}

export class MerchantRoleHasNoPermException extends UnauthorizedException {
  readonly code: number = 301004;
  readonly msg: string = '该用户角色无权限访问';
}

export class MerchantIllegalRequestException extends UnauthorizedException {
  readonly code: number = 301005;
  readonly msg: string = '非法请求，请重新登陆';
}

export class MerchantAuthExpiredException extends UnauthorizedException {
  readonly code: number = 301006;
  readonly msg: string = '身份认证已过期，请重新登录';
}

export class LandingElsewhereException extends UnauthorizedException {
  readonly code: number = 301007;
  readonly msg: string = '账号已在其他地方登陆，请重新登录';
}

export class MerchantAuthFailedException extends UnauthorizedException {
  readonly code: number = 301008;
  readonly msg: string = '身份认证失败，请重新登录';
}

export class MerchantAbnormalUserException extends UnauthorizedException {
  readonly code: number = 301009;
  readonly msg: string = '该用户状态异常，无法登陆';
}

export class MerchantDisabledException extends UnauthorizedException {
  readonly code: number = 301010;
  readonly msg: string = '该用户所属商户已被禁用，无法登陆';
}

export class InvalidMerchantTokenException extends UnauthorizedException {
  readonly code: number = 301011;
  readonly msg: string = '无效的认证身份，请重新登陆';
}

export class MerchantUserChangedException extends UnauthorizedException {
  readonly code: number = 301012;
  readonly msg: string = '您的用户数据有变更，请重新登陆';
}

export class MerchantExpiredException extends UnauthorizedException {
  readonly code: number = 301013;
  readonly msg: string = '该用户所属商户已过期，无法登陆';
}
