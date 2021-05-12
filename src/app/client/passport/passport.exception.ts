import { UnauthorizedException } from '@jiaxinjiang/nest-exception';

export class ClientLoginFailedException extends UnauthorizedException {
  readonly code: number = 401001;
  readonly msg: string = '微信用户授权失败';
}

export class ClientMerchantDisabledException extends UnauthorizedException {
  readonly code: number = 401002;
  readonly msg: string = '十分抱歉，您访问的商户已被禁用';
}

export class ClientMerchantNotExistsException extends UnauthorizedException {
  readonly code: number = 401003;
  readonly msg: string = '您访问的商户不存在';
}

export class ClientIllegalRequestException extends UnauthorizedException {
  readonly code: number = 401004;
  readonly msg: string = '非法请求，请重新登陆';
}

export class ClientAuthExpiredException extends UnauthorizedException {
  readonly code: number = 401005;
  readonly msg: string = '身份认证已过期';
}

export class ClientLandingElsewhereException extends UnauthorizedException {
  readonly code: number = 401006;
  readonly msg: string = '账号已在其他地方登陆';
}

export class ClientAuthFailedException extends UnauthorizedException {
  readonly code: number = 401007;
  readonly msg: string = '身份认证失败';
}

export class ClientInvalidLoginTypeException extends UnauthorizedException {
  readonly code: number = 401008;
  readonly msg: string = '无效的客户端类型';
}

export class ClientUserChangedException extends UnauthorizedException {
  readonly code: number = 401009;
  readonly msg: string = '您的账号信息已被管理员修改，请重新登陆';
}

export class ClientUserDisabledException extends UnauthorizedException {
  readonly code: number = 401010;
  readonly msg: string = '您的账号已被管理员禁用';
}
