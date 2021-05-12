import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantMenuOrderGetListException extends ApiException {
  readonly code: number = 326001;
  readonly msg: string = '获取订单列表失败';
}

export class MerchantMenuOrderGetDetailException extends ApiException {
  readonly code: number = 326002;
  readonly msg: string = '获取订单详情失败';
}

export class MerchantMenuOrderServingException extends ApiException {
  readonly code: number = 326003;
  readonly msg: string = '修改上餐状态失败';
}

export class MerchantMenuOrderUpdateException extends ApiException {
  readonly code: number = 326006;
  readonly msg: string = '修改订单价格失败';
}

export class MerchantMenuOrderAgreeCancelException extends ApiException {
  readonly code: number = 326007;
  readonly msg: string = '同意订单退单失败';
}

export class MerchantMenuOrderRefuseCancelException extends ApiException {
  readonly code: number = 326008;
  readonly msg: string = '拒绝订单退单失败';
}

export class MerchantMenuOrderCompleteException extends ApiException {
  readonly code: number = 326009;
  readonly msg: string = '设置订单完成状态失败';
}

export class MerchantMenuOrderPrintException extends ApiException {
  readonly code: number = 326010;
  readonly msg: string = '订单打印异常';
}

export class MerchantMenuOrderIsPaidException extends ApiException {
  readonly code: number = 326010;
  readonly msg: string = '该订单已支付';
}

export class MerchantMenuOrderSetPaidException extends ApiException {
  readonly code: number = 326011;
  readonly msg: string = '设置订单已支付状态失败';
}

export class MerchantMenuOrderLackOfStockException extends ApiException {
  readonly code: number = 326012;
  readonly msg: string = '库存不足';
}

export class MerchantMenuOrderInvalidTableException extends ApiException {
  readonly code: number = 326013;
  readonly msg: string = '无效的餐桌，请重新进行点餐';
}

export class MerchantMenuOrderSubmitException extends ApiException {
  readonly code: number = 326014;
  readonly msg: string = '提交订单失败';
}
