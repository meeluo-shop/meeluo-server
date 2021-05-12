'use strict';

import BaseClient from '../../Core/BaseClient';
import { createHmac } from '../../Core/Utils';

export default class OpenDataClient extends BaseClient {
  protected baseUrl = 'https://api.weixin.qq.com/wxa/';

  removeUserStorage(
    openid: string,
    sessionKey: string,
    key: Array<string>,
  ): Promise<any> {
    const data = {
      key: key,
    };
    const query = {
      openid: openid,
      sig_method: 'hmac_sha256',
      signature: createHmac(JSON.stringify(data), sessionKey, 'sha256'),
    };

    return this.httpPostJson('remove_user_storage', data, query);
  }

  setUserStorage(
    openid: string,
    sessionKey: string,
    kvList: object,
  ): Promise<any> {
    const data = {
      kv_list: this.formatKVLists(kvList),
    };
    const query = {
      openid: openid,
      sig_method: 'hmac_sha256',
      signature: createHmac(JSON.stringify(data), sessionKey, 'sha256'),
    };

    return this.httpPostJson('set_user_storage', data, query);
  }

  protected formatKVLists(params: object): Array<object> {
    const formatted = [];

    for (const key in params) {
      formatted.push({
        name: key,
        value: params[key],
      });
    }

    return formatted;
  }
}
