import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientAttendantGetException extends ApiException {
  readonly code: number = 414001;
  readonly msg: string = '获取客服信息失败';
}
