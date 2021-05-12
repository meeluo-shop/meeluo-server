import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantPointsLogListException extends ApiException {
  readonly code: number = 310001;
  readonly msg: string = '获取用户积分明细列表失败';
}
