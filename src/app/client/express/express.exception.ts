import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientExpressQueryNoException extends ApiException {
  readonly code: number = 415001;
  readonly msg: string = '查询快递单号失败';
}
