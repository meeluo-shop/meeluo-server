import { ApiException } from '@jiaxinjiang/nest-exception';

export class SMSSendOftenException extends ApiException {
  readonly code: number = 907001;
  readonly msg: string = '短信发送频繁，请稍后再发';
}

export class SMSSendCountLimitException extends ApiException {
  readonly code: number = 907002;
  readonly msg: string = '短信发送数量已达上限，请明日再发';
}
