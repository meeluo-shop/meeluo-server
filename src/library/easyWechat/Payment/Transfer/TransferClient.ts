'use strict';

import BaseClient from '../Core/BaseClient';
import { Merge } from '../../Core/Merge';
import * as Fs from 'fs';
import * as NodeRsa from 'node-rsa';

export default class TransferClient extends BaseClient {
  /**
   * 查询付款到零钱的订单
   * @param partnerTradeNo 商户订单号
   */
  queryBalanceOrder(partnerTradeNo: string): Promise<any> {
    const params = {
      appid: this.app['config']['appid'],
      mch_id: this.app['config']['mchId'],
      partner_trade_no: partnerTradeNo,
    };

    return this.safeRequest('mmpaymkttransfers/gettransferinfo', params);
  }

  /**
   * 查询付款到银行卡的订单
   * @param partnerTradeNo 商户订单号
   */
  queryBankCardOrder(partnerTradeNo: string): Promise<any> {
    const params = {
      mch_id: this.app['config']['mchId'],
      partner_trade_no: partnerTradeNo,
    };

    return this.safeRequest('mmpaymkttransfers/query_bank', params);
  }

  /**
   * 企业付款到用户零钱
   * @param params 付款信息
   */
  toBalance(params: object): Promise<any> {
    const base = {
      mch_id: null,
      mchid: this.app['config']['mchId'],
      mch_appid: this.app['config']['appid'],
    };

    if (!params['spbill_create_ip']) {
      params['spbill_create_ip'] = this.getServerIp();
    }

    return this.safeRequest(
      'mmpaymkttransfers/promotion/transfers',
      Merge(base, params),
    );
  }

  /**
   * 企业付款到银行卡
   * @param params 付款信息
   */
  toBankCard(params: object): Promise<any> {
    [
      'bank_code',
      'partner_trade_no',
      'enc_bank_no',
      'enc_true_name',
      'amount',
    ].map(key => {
      if (!params[key]) {
        throw new Error(`${key} is required.`);
      }
    });

    const publicKey = Fs.readFileSync(
      this.app['config']['rsa_public_key_path'],
    ).toString();
    const rsa = new NodeRsa(publicKey);
    params['enc_bank_no'] = rsa.encrypt(params['enc_bank_no'], 'hex');
    params['enc_true_name'] = rsa.encrypt(params['enc_true_name'], 'hex');

    return this.safeRequest('mmpaymkttransfers/pay_bank', params);
  }
}
