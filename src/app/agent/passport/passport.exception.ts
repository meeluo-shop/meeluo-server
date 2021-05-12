import {
  UnauthorizedException,
  ApiException,
} from '@jiaxinjiang/nest-exception';

export class AgentInvalidUserException extends ApiException {
  readonly code: number = 202001;
  readonly msg: string = '账号或密码不正确';
}

export class AgentUserDisabledException extends ApiException {
  readonly code: number = 202002;
  readonly msg: string = '该账号已被禁用';
}

export class AgentLoginFailedException extends ApiException {
  readonly code: number = 202003;
  readonly msg: string = '用户登陆失败，请重新登陆';
}

export class AgentRoleHasNoPermException extends UnauthorizedException {
  readonly code: number = 202004;
  readonly msg: string = '该用户角色无权限访问';
}

export class AgentIllegalRequestException extends UnauthorizedException {
  readonly code: number = 202005;
  readonly msg: string = '非法请求，请重新登陆';
}

export class AgentAuthExpiredException extends UnauthorizedException {
  readonly code: number = 202006;
  readonly msg: string = '身份认证已过期，请重新登录';
}

export class LandingElsewhereException extends UnauthorizedException {
  readonly code: number = 202007;
  readonly msg: string = '账号已在其他地方登陆，请重新登录';
}

export class AgentAuthFailedException extends UnauthorizedException {
  readonly code: number = 202008;
  readonly msg: string = '身份认证失败，请重新登录';
}

export class AgentAbnormalUserException extends UnauthorizedException {
  readonly code: number = 202009;
  readonly msg: string = '该用户状态异常，无法登陆';
}

export class InvalidAgentTokenException extends UnauthorizedException {
  readonly code: number = 202010;
  readonly msg: string = '无效的认证身份，请重新登陆';
}

export class AgentExpiredException extends UnauthorizedException {
  readonly code: number = 202011;
  readonly msg: string = '当前代理商授权已过期，无法登陆';
}

export class AgentDisabledException extends UnauthorizedException {
  readonly code: number = 202012;
  readonly msg: string = '当前代理商已被禁用，无法登陆';
}
