'use strict';

import BaseClient, {
  AccessToken,
} from '../../../../OfficialAccount/OAuth/OAuthClient';

export default class Client extends BaseClient {
  /**
   * 获取配置中的appid
   */
  getAppId(): string {
    return this.app['config']['appid'];
  }

  /**
   * 获取授权后的token
   */
  async getToken(): Promise<AccessToken> {
    return this.app['access_token'].getToken();
  }
}
