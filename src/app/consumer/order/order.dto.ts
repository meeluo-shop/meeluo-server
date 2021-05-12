export enum OrderMessageTypeEnum {
  AUTO_CANCEL_NOT_PAY_ORDER = 10,
  AUTO_RECEIPT_ORDER = 20,
  AUTO_EXPIRE_WINNING = 30,
  AUTO_RECEIPT_WINNING = 40,
  AUTO_CANCEL_NOT_PAY_MENU_ORDER = 50,
  AUTO_COMPLETE_MENU_ORDER = 60,
}

export class OrderMessage {
  orderId: number;
  userId: number;
  merchantId: number;
}

export class Message<D, T = any> {
  type?: T;
  data: D;
}
