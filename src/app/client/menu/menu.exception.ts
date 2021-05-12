import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientMenuOrderSubmitException extends ApiException {
  readonly code: number = 416002;
  readonly msg: string = '十分抱歉！订单提交失败，请联系客服人员处理';
}

export class ClientMenuOrderPayLockedException extends ApiException {
  readonly code: number = 416003;
  readonly msg: string = '您上一个订单还未处理完成，请稍后再提交';
}

export class ClientMenuOrderGetListException extends ApiException {
  readonly code: number = 416004;
  readonly msg: string = '获取订单列表失败';
}

export class ClientMenuOrderGetDetailException extends ApiException {
  readonly code: number = 416005;
  readonly msg: string = '获取订单详情失败';
}

export class ClientMenuOrderPaymentException extends ApiException {
  readonly code: number = 416006;
  readonly msg: string = '十分抱歉！订单付款失败，请联系客服人员处理';
}

export class ClientMenuOrderCancelException extends ApiException {
  readonly code: number = 416007;
  readonly msg: string = '十分抱歉！订单取消失败，请联系客服人员处理';
}

export class ClientMenuOrderInvalidTableException extends ApiException {
  readonly code: number = 416008;
  readonly msg: string = '无效的餐桌，请重新进行点餐';
}

export class ClientMenuOrderInvaildPaymentOrderIdException extends ApiException {
  readonly code: number = 416009;
  readonly msg: string = '无效的支付订单，请联系客服人员处理';
}

export class ClientMenuOrderWechatPaymentException extends ApiException {
  readonly code: number = 416010;
  readonly msg: string = '微信支付订单失败，请联系客服人员处理';
}

export class ClientMenuOrderPickUpGoodsException extends ApiException {
  readonly code: number = 416011;
  readonly msg: string = '修改上餐状态失败，请联系客服人员处理';
}

export class ClientMenuGetPayTypeSettingException extends ApiException {
  readonly code: number = 416012;
  readonly msg: string = '获取支付方式列表失败';
}

export class ClientMenuOrderServingException extends ApiException {
  readonly code: number = 416013;
  readonly msg: string = '设置为已上餐状态失败';
}

export class ClientMenuOrderCompleteException extends ApiException {
  readonly code: number = 416014;
  readonly msg: string = '设置订单完成状态失败';
}

export class ClientMenuOrderAgreeCancelException extends ApiException {
  readonly code: number = 416015;
  readonly msg: string = '同意订单退单失败';
}

export class ClientMenuOrderRefuseCancelException extends ApiException {
  readonly code: number = 416016;
  readonly msg: string = '拒绝订单退单失败';
}

export class ClientMenuOrderPrintException extends ApiException {
  readonly code: number = 416017;
  readonly msg: string = '订单小票打印失败';
}

export class ClientMenuOrderSetPaidException extends ApiException {
  readonly code: number = 416018;
  readonly msg: string = '设置订单付款状态失败';
}
