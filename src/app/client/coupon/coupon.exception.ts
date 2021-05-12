import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientCouponGetListException extends ApiException {
  readonly code: number = 417001;
  readonly msg: string = '获取优惠券列表失败';
}
