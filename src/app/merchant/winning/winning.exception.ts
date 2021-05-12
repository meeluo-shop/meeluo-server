import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantWinningGetListException extends ApiException {
  readonly code: number = 321001;
  readonly msg: string = '获取获奖记录列表失败';
}

export class MerchantWinningGetDetailException extends ApiException {
  readonly code: number = 321002;
  readonly msg: string = '获取获奖记录详情失败';
}

export class MerchantWinningDeliverPrizeException extends ApiException {
  readonly code: number = 321003;
  readonly msg: string = '奖品发货失败';
}

export class MerchantWinningReceiptException extends ApiException {
  readonly code: number = 321004;
  readonly msg: string = '奖品确认收货失败';
}
