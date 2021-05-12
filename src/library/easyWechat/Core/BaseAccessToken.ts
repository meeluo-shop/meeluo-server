'use strict';

import BaseApplication from './BaseApplication';
import HttpMixin from './Mixins/HttpMixin';
import { createHash, applyMixins } from './Utils';

class BaseAccessToken implements HttpMixin {
  protected requestMethod = 'GET';
  protected token = '';
  protected queryName = '';
  protected tokenKey = 'access_token';
  protected endpointToGetToken = '';
  protected app: BaseApplication = null;

  constructor(app: BaseApplication) {
    this.app = app;
  }

  protected async getCredentials(): Promise<object> {
    return {};
  }

  async getEndpoint(): Promise<string> {
    if (!this.endpointToGetToken) {
      throw new Error('Unset the endpoint of AccessToken');
    }
    return this.endpointToGetToken;
  }

  async getCacheKey(): Promise<string> {
    return (
      'easywechat.kernel.access_token.' +
      createHash(JSON.stringify(await this.getCredentials()), 'md5')
    );
  }

  async requestToken(credentials: object): Promise<any> {
    const payload = {
      url: await this.getEndpoint(),
      method: this.requestMethod,
    };
    if (this.requestMethod == 'POST') {
      payload['json'] = true;
      payload['body'] = credentials;
    } else {
      payload['qs'] = credentials;
    }
    return await this.doRequest(payload);
  }

  /**
   * 获取Token
   * @param refresh 为true时表示强制刷新
   */
  async getToken(refresh = false): Promise<string> {
    const cacheKey = await this.getCacheKey();
    const cache = this.app.getCache();
    if (!refresh && (await cache.has(cacheKey))) {
      const token = await cache.get(cacheKey);
      if (token) return token;
    }
    const res = await this.requestToken(await this.getCredentials());
    if (res.errmsg) {
      throw new Error(res.errmsg);
    }
    await this.setToken(res[this.tokenKey], res.expires_in || 7200);
    return res[this.tokenKey];
  }

  /**
   * 设置Token
   * @param access_token AccessToken
   * @param expires_in 有效时间，单位：秒
   */
  async setToken(
    access_token: string,
    expires_in = 7200,
  ): Promise<BaseAccessToken> {
    const cacheKey = await this.getCacheKey();
    const cache = this.app.getCache();
    await cache.set(cacheKey, access_token, expires_in);
    if (!cache.has(cacheKey)) {
      throw new Error('Failed to cache access token.');
    }
    return this;
  }

  /**
   * 刷新Token
   */
  async refresh(): Promise<BaseAccessToken> {
    await this.getToken(true);
    return this;
  }

  /**
   * 获取刷新后的Token
   */
  getRefreshedToken(): Promise<string> {
    return this.getToken(true);
  }

  getTokenKey(): string {
    return this.tokenKey;
  }

  async applyToRequest(payload: object, refresh = false): Promise<object> {
    payload['qs'] = payload['qs'] || {};
    if (!payload['qs'][this.queryName || this.tokenKey] || refresh) {
      payload['qs'][this.queryName || this.tokenKey] = await this.getToken(
        refresh,
      );
    }
    return payload;
  }

  // Rewrite by HttpMixin
  async doRequest(payload: object, returnResponse = false): Promise<any> {}
}

applyMixins(BaseAccessToken, [HttpMixin]);

export default BaseAccessToken;
