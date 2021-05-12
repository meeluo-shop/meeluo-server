'use strict';

import BaseClient from '../Core/BaseClient';
import { Merge } from '../../Core/Merge';
import { isObject } from '../../Core/Utils';

export default class RedpackClient extends BaseClient {
  /**
   * 查询红包信息
   * @param mchBillno 商户订单号
   */
  info(mchBillno: any): Promise<any> {
    let params = isObject(mchBillno)
      ? mchBillno
      : {
          mch_billno: mchBillno,
        };

    params = Merge({}, params, {
      appid: this.app['config']['appid'],
      bill_type: 'MCHT',
    });

    return this.safeRequest('mmpaymkttransfers/gethbinfo', params);
  }

  /**
   * 发送普通红包
   * @param params 红包参数
   */
  async sendNormal(params: object): Promise<any> {
    params = Merge({}, params, {
      wxappid: this.app['config']['appid'],
      total_num: 1,
      client_ip: params['client_ip'] || (await this.getServerIp()),
    });

    return await this.safeRequest('mmpaymkttransfers/sendredpack', params);
  }

  /**
   * 发送裂变红包
   * @param params 红包参数
   */
  sendGroup(params: object): Promise<any> {
    params = Merge({}, params, {
      wxappid: this.app['config']['appid'],
      amt_type: 'ALL_RAND',
    });

    return this.safeRequest('mmpaymkttransfers/sendgroupredpack', params);
  }
}
