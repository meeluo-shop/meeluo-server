import { ApiException } from '@jiaxinjiang/nest-exception';

export class HttpRequestApiException extends ApiException {
  readonly code: number = 1000101;
  readonly msg: string = 'http接口调用失败';
}
