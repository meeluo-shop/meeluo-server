import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientUserGradeGetListException extends ApiException {
  readonly code: number = 406101;
  readonly msg: string = '获取会员列表信息失败';
}
