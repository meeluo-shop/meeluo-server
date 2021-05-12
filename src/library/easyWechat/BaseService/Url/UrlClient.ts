'use strict';

import BaseClient from '../../Core/BaseClient';

export default class UrlClient extends BaseClient {
  protected baseUri = 'https://api.weixin.qq.com/';

  /**
   * 获取短网址
   * @param long_url 原始URL地址
   */
  shorten(long_url): Promise<any> {
    const data = {
      action: 'long2short',
      long_url,
    };

    return this.httpPostJson('cgi-bin/shorturl', data);
  }
}
