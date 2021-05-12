'use strict';

import BaseAccessToken from '../../Core/BaseAccessToken';

export default class AccessToken extends BaseAccessToken {
  protected endpointToGetToken = 'cgi-bin/token';

  protected async getCredentials(): Promise<object> {
    return {
      appid: this.app['config']['appid'],
      secret: this.app['config']['secret'],
      grant_type: 'client_credential',
    };
  }
}
