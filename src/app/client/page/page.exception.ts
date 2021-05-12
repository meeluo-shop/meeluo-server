import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientPageInfoException extends ApiException {
  readonly code: number = 404001;
  readonly msg: string = '获取页面数据信息失败';
}

export class ClientPageListException extends ApiException {
  readonly code: number = 404002;
  readonly msg: string = '获取页面列表失败';
}
