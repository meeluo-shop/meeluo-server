import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientWinningGetListException extends ApiException {
  readonly code: number = 409001;
  readonly msg: string = '获取获奖记录列表失败';
}

export class ClientWinningGetDetailException extends ApiException {
  readonly code: number = 409002;
  readonly msg: string = '获取获奖记录详情失败';
}

export class ClientWinningRemindDeliveryException extends ApiException {
  readonly code: number = 409003;
  readonly msg: string = '确认奖品订单失败';
}

export class ClientWinningInvaildPrizeOrderException extends ApiException {
  readonly code: number = 409004;
  readonly msg: string = '无效的奖品订单';
}

export class ClientWinningConfirmReceiptException extends ApiException {
  readonly code: number = 409005;
  readonly msg: string = '确认奖品失败';
}

export class ClientWinningDeliverPrizeException extends ApiException {
  readonly code: number = 409006;
  readonly msg: string = '奖品发放失败';
}
