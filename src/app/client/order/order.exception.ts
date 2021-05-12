import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientOrderGetDeliveryFeeException extends ApiException {
  readonly code: number = 411001;
  readonly msg: string = '获取商品运费信息失败';
}

export class ClientOrderIsNotIntraRegionException extends ApiException {
  readonly code: number = 411002;
  readonly msg: string = '收货地址不在商品配送范围内';
}

export class ClientOrderLackOfStockException extends ApiException {
  readonly code: number = 411003;
  readonly msg: string = '库存不足';
}

export class ClientOrderSubmitException extends ApiException {
  readonly code: number = 411004;
  readonly msg: string = '十分抱歉！订单提交失败，请联系客服人员处理';
}

export class ClientOrderPayLockedException extends ApiException {
  readonly code: number = 411005;
  readonly msg: string = '您上一个订单还未处理完成，请稍后再提交';
}

export class ClientOrderGetListException extends ApiException {
  readonly code: number = 411006;
  readonly msg: string = '获取订单列表失败';
}

export class ClientOrderGetDetailException extends ApiException {
  readonly code: number = 411007;
  readonly msg: string = '获取订单详情失败';
}

export class ClientOrderPaymentException extends ApiException {
  readonly code: number = 411008;
  readonly msg: string = '十分抱歉！订单付款失败，请联系客服人员处理';
}

export class ClientOrderCancelException extends ApiException {
  readonly code: number = 411009;
  readonly msg: string = '十分抱歉！订单取消失败，请联系客服人员处理';
}

export class ClientOrderReceiptException extends ApiException {
  readonly code: number = 411010;
  readonly msg: string = '十分抱歉！确认收货失败，请联系客服人员处理';
}

export class ClientOrderInvaildPaymentOrderIdException extends ApiException {
  readonly code: number = 411011;
  readonly msg: string = '无效的支付订单，请联系客服人员处理';
}

export class ClientOrderWechatPaymentException extends ApiException {
  readonly code: number = 411012;
  readonly msg: string = '微信支付订单失败，请联系客服人员处理';
}

export class ClientOrderPickUpGoodsException extends ApiException {
  readonly code: number = 411013;
  readonly msg: string = '商品发放失败，请联系客服人员处理';
}