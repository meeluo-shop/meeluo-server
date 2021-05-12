import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantOrderGetListException extends ApiException {
  readonly code: number = 322001;
  readonly msg: string = '获取订单列表失败';
}

export class MerchantOrderGetDetailException extends ApiException {
  readonly code: number = 322002;
  readonly msg: string = '获取订单详情失败';
}

export class MerchantOrderGetExpressListException extends ApiException {
  readonly code: number = 322003;
  readonly msg: string = '获取物流公司列表失败';
}

export class MerchantOrderPickUpGoodsException extends ApiException {
  readonly code: number = 322004;
  readonly msg: string = '自提商品发放失败';
}

export class MerchantOrderDeliverGoodsException extends ApiException {
  readonly code: number = 322005;
  readonly msg: string = '商品发货失败';
}

export class MerchantOrderUpdateException extends ApiException {
  readonly code: number = 322006;
  readonly msg: string = '修改订单价格失败';
}

export class MerchantOrderAgreeCancelException extends ApiException {
  readonly code: number = 322007;
  readonly msg: string = '同意商品订单退单失败';
}

export class MerchantOrderRefuseCancelException extends ApiException {
  readonly code: number = 322008;
  readonly msg: string = '拒绝商品订单退单失败';
}
