'use strict';

import BaseClient from '../Core/BaseClient';
import { humpToSnake } from '../../Core/Utils';

export interface RefundParams {
  transactionId?: string;
  outTradeNo?: string;
  totalFee: number; // 单位分，必须为整数类型
  refundFee: number; // 单位分，必须为整数类型
  outRefundNo: string;
  refundFeeType?: string;
  refundDesc?: string;
  refundAccount?:
    | 'REFUND_SOURCE_UNSETTLED_FUNDS'
    | 'REFUND_SOURCE_RECHARGE_FUNDS';
  notifyUrl?: string;
}

export default class RefundClient extends BaseClient {
  /**
   * 根据商户订单号退款
   */
  byOutTradeNumber(
    params: RefundParams & { outTradeNo: string },
  ): Promise<any> {
    return this.refund(params);
  }

  /**
   * 根据支付交易号退款
   */
  byTransactionId(
    params: RefundParams & { transactionId: string },
  ): Promise<any> {
    return this.refund(params);
  }

  protected refund(params: RefundParams): Promise<any> {
    params = humpToSnake(params);
    return this.safeRequest(
      this.wrap(this.app['inSandbox']() ? 'pay/refund' : 'secapi/pay/refund'),
      params,
    );
  }

  /**
   * 根据支付交易号查询退款
   * @param transactionId 支付交易号
   */
  queryByTransactionId(transactionId: string): Promise<any> {
    return this.query(transactionId, 'transaction_id');
  }

  /**
   * 根据商户订单号查询退款
   * @param outTradeNumber 商户订单号
   */
  queryByOutTradeNumber(outTradeNumber: string): Promise<any> {
    return this.query(outTradeNumber, 'out_trade_no');
  }

  /**
   * 根据商户退款订单号查询退款
   * @param outRefundNumber 商户退款订单号
   */
  queryByOutRefundNumber(outRefundNumber: string): Promise<any> {
    return this.query(outRefundNumber, 'out_refund_no');
  }

  /**
   * 根据退款交易号查询
   * @param refundId 退款交易号
   */
  queryByRefundId(refundId: string): Promise<any> {
    return this.query(refundId, 'refund_id');
  }

  protected query(number: string, type: string): Promise<any> {
    const params = {
      appid: this.app['config']['appid'],
    };
    params[type] = number;

    return this.request(this.wrap('pay/refundquery'), params);
  }
}
