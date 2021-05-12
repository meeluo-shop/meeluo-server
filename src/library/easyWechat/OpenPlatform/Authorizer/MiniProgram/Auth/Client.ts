'use strict';

import BaseClient from '../../../../Core/BaseClient';

export default class Client extends BaseClient {
  protected component = null;

  constructor(app, component) {
    super(app);

    this.component = component;
  }

  /**
   * 小程序登录，jscode换取session_key
   * @param code wx.login 获取的 code
   */
  async session(code: string): Promise<any> {
    const access_token = await this.component['access_token'].getToken()[
      'component_access_token'
    ];
    return this.httpGet('sns/component/jscode2session', {
      appid: this.app['config']['appid'],
      js_code: code,
      grant_type: 'authorization_code',
      component_appid: this.component['config']['appid'],
      component_access_token: access_token,
    });
  }
}
