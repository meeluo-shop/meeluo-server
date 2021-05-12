'use strict';

import BaseAccessToken from './BaseAccessToken';
import BaseApplication from './BaseApplication';
import HttpMixin from './Mixins/HttpMixin';
import { applyMixins, isString } from './Utils';
import * as Fs from 'fs';
import { Merge } from '../Core/Merge';
import Response from './Http/Response';

class BaseClient implements HttpMixin {
  protected accessToken: BaseAccessToken = null;
  protected app: BaseApplication = null;

  constructor(app: BaseApplication, accessToken: BaseAccessToken = null) {
    this.app = app;
    this.accessToken = accessToken || this.app['accessToken'];
  }

  setAccessToken(accessToken): BaseClient {
    this.accessToken = accessToken;

    return this;
  }

  getAccessToken(): BaseAccessToken {
    return this.accessToken;
  }

  async request(
    payload: object,
    returnResponse = false,
    retry = 3,
  ): Promise<any> {
    if (!payload['method']) {
      payload['method'] = 'POST';
    }
    if (!payload['qs']) {
      payload['qs'] = {};
    }
    if (this.accessToken) {
      payload = await this.accessToken.applyToRequest(payload);
      const resp = await this.doRequest(payload, returnResponse);
      if (resp && resp.errcode) {
        this['app']['log']('error:', JSON.stringify(resp));
        const err: any = new Error(resp.errmsg);
        err.name = 'WeChatAPIError';
        err.code = resp.errcode;
        if ((err.code === 40001 || err.code === 42001) && retry > 1) {
          // 销毁已过期的token
          payload = await this.accessToken.applyToRequest(payload, true);
          return this.request(payload, returnResponse, retry - 1);
        }
        throw err;
      }
      return resp;
    }
    return this.doRequest(payload, returnResponse);
  }

  httpUpload(
    url: string,
    files: object = {},
    form: object = {},
    query: object = {},
  ): Promise<any> {
    let formData = {};

    for (const name in files) {
      if (isString(files[name])) {
        formData[name] = Fs.createReadStream(files[name]);
      } else {
        formData[name] = files[name];
      }
    }

    formData = Merge(formData, form);

    return this.request({
      url,
      formData,
      method: 'POST',
      qs: query,
    });
  }

  httpGet(url: string, query: object = {}): Promise<any> {
    const payload = {
      url,
      method: 'GET',
      qs: query,
    };
    return this.request(payload);
  }

  httpPost(url: string, formData: object = {}): Promise<any> {
    const payload = {
      url,
      method: 'POST',
      formData,
    };
    return this.request(payload);
  }

  httpPostJson(
    url: string,
    data: object = {},
    query: object = {},
  ): Promise<any> {
    const payload = {
      url,
      method: 'POST',
      json: true,
      body: data,
      qs: query,
    };
    return this.request(payload);
  }

  async requestRaw(payload: object): Promise<Response> {
    payload = payload || {};
    payload['encoding'] = null;
    const res = await this.request(payload, true);
    return new Response(res.body, res.statusCode, res.headers);
  }
  // Rewrite by HttpMixin
  async doRequest(payload: object, returnResponse = false): Promise<any> {}
}

applyMixins(BaseClient, [HttpMixin]);

export default BaseClient;
