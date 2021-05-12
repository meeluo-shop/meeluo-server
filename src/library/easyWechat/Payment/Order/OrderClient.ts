'use strict';

import BaseClient from '../Core/BaseClient';
import {
  getTimestamp,
  humpToSnake,
  makeSignature,
  randomString,
  snakeToHump,
} from '../../Core/Utils';

export interface OrderQueryParams {
  appid?: string; //	wxd678efh567hg6787	微信支付分配的公众账号ID（企业号corpid即为此appId）
  mchId?: string; //	1230000109	微信支付分配的商户号
  transactionId?: string; // 二选一 1009660380201506130728806387	微信的订单号，建议优先使用
  outTradeNo?: string; // 二选一 20150806125346	商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*@ ，且在同一个商户号下唯一。 详见商户订单号
  nonceStr?: string; //	C380BEC2BFD727A4B6845133519F3AD6	随机字符串，不长于32位。推荐随机数生成算法
  sign?: string; //	5K8264ILTKCH16CQ2502SI8ZNMTM67VS	通过签名算法计算得出的签名值，详见签名生成算法
  signType?: 'HMAC-SHA256' | 'MD5'; // HMAC-SHA256	签名类型，目前支持HMAC-SHA256和MD5，默认为MD5
}

export interface OrderQueryResp {
  returnCode: 'SUCCESS' | 'FAIL';
  returnMsg: string;
  appid?: string;
  mchId?: string;
  nonceStr?: string;
  sign?: string;
  resultCode?: string;
  errCode?: string;
  errCodeDes?: string;
  openid?: string; // trade_type=JSAPI，此参数必传，用户在商户appid下的唯一标识。
  deviceInfo?: string; // 终端设备号(门店号或收银设备ID)，注意：PC网页或公众号内支付请传"WEB"
  isSubscribe?: 'Y' | 'N';
  tradeType: 'JSAPI' | 'NATIVE' | 'APP'; // 小程序取值如下：JSAPI，详细说明见参数规定
  /**
    SUCCESS—支付成功
    REFUND—转入退款
    NOTPAY—未支付
    CLOSED—已关闭
    REVOKED—已撤销（付款码支付）
    USERPAYING--用户支付中（付款码支付）
    PAYERROR--支付失败(其他原因，如银行返回失败)
   */
  tradeState?:
    | 'SUCCESS'
    | 'REFUND'
    | 'NOTPAY'
    | 'CLOSED'
    | 'REVOKED'
    | 'USERPAYING'
    | 'PAYERROR';
  bankType?: string;
  totalFee?: number; // 订单总金额，只能为整数，详见支付金额
  settlementTotalFee?: string; // 应结订单金额=订单金额-非充值代金券金额，应结订单金额<=订单金额
  feeType?: string; // 符合ISO 4217标准的三位字母代码，默认人民币：CNY，其他值列表详见货币类型
  cashFee?: string; // 现金支付金额订单现金支付金额，单位为分
  cashFeeType?: string; // 货币类型，符合ISO 4217标准的三位字母代码，默认人民币：CNY
  transactionId?: string; // 二选一 1009660380201506130728806387	微信的订单号，建议优先使用
  outTradeNo?: string; // 二选一 20150806125346	商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*@ ，且在同一个商户号下唯一。 详见商户订单号
  attach?: string; // 附加数据，在查询API和支付通知中原样返回，该字段主要用于商户携带订单的自定义数据
  timeEnd?: string; // 支付完成时间，格式为yyyyMMddHHmmss
  tradeStateDesc?: string; // 对当前查询订单状态的描述和下一步操作的指引
}

export default class OrderClient extends BaseClient {
  /**
   * 统一下单
   * @param params 订单信息
   * @param isContract 是否支付中签约，默认 false
   */
  async unify(params: object, isContract = false): Promise<any> {
    if (!params['spbill_create_ip']) {
      params['spbill_create_ip'] =
        'NATIVE' === params['trade_type']
          ? await this.getServerIp()
          : this.getClientIp();
    }

    params['appid'] = this.app['config']['appid'];
    params['notify_url'] = this.app['config']['notifyUrl'];

    if (isContract) {
      params['contract_appid'] = this.app['config']['appid'];
      params['contract_mchid'] = this.app['config']['mchId'];
      params['request_serial'] = params['request_serial'] || getTimestamp();
      params['contract_notify_url'] =
        params['contract_notify_url'] ||
        this.app['config']['contract_notify_url'];
    }

    return this.request(this.wrap('pay/contractorder'), params);
  }

  async query(params: OrderQueryParams, repeat = 0): Promise<OrderQueryResp> {
    params.appid = params.appid || this.app['config']['appid'];
    params.mchId = params.mchId || this.app['config']['mchId'];
    params.nonceStr = params.nonceStr || randomString(32);
    params.signType = params.signType || 'MD5';
    const newParams = humpToSnake(params);
    newParams.sign = makeSignature(
      newParams,
      this.app['config']['key'],
      params.signType,
    );
    let resp = await this.request(this.wrap('pay/orderquery'), newParams);
    resp = snakeToHump(resp);
    if (repeat > 1 && resp.returnCode !== 'SUCCESS') {
      return this.query(params, repeat - 1);
    }
    return resp;
  }

  /**
   * 关闭订单
   * @param tradeNo 商户订单号
   */
  close(tradeNo: string): Promise<any> {
    const params = {
      appid: this.app['config']['appid'],
      out_trade_no: tradeNo,
    };

    return this.request(this.wrap('pay/closeorder'), params);
  }
}
