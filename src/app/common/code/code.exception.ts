import { ApiException } from '@jiaxinjiang/nest-exception';

export class CodeVerifyException extends ApiException {
  readonly code: number = 906001;
  readonly msg: string = '验证码错误';
}
