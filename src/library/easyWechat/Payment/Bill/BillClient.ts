'use strict';

import BaseClient from '../Core/BaseClient';
import { Merge } from '../../Core/Merge';
import StreamResponse from '../../Core/Http/StreamResponse';

export default class BillClient extends BaseClient {
  /**
   * 下载对账单
   * @param date 对账单的日期，格式：20140603
   * @param type 账单类型，默认：ALL
   * @param options 其它参数
   */
  async get(date: string, type = 'ALL', options: object = {}): Promise<any> {
    options = options || {};
    options['encoding'] = 'binary';

    let params = {
      appid: this.app['config']['appid'],
      bill_date: date,
      bill_type: type,
    };
    params = Merge(params, options);

    const res = await this.requestRaw(this.wrap('pay/downloadbill'), params);

    const content = res.getContent().toString();
    if (content && content.indexOf('<xml>') === 0) {
      return await this.parseXml(content);
    }

    return StreamResponse.buildFromResponse(res);
  }
}
