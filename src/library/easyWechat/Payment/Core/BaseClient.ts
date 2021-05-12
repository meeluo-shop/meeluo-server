'use strict';

import BaseApplication from '../../Core/BaseApplication';
import HttpMixin from '../../Core/Mixins/HttpMixin';
import {
  applyMixins,
  randomString,
  makeSignature,
  singleItem,
} from '../../Core/Utils';
import { Merge } from '../../Core/Merge';
import * as Xml2js from 'xml2js';
import * as Fs from 'fs';
import * as RawBody from 'raw-body';
import Response from '../../Core/Http/Response';

class BaseClient implements HttpMixin {
  protected app: BaseApplication = null;

  protected serverIp = '';

  constructor(app: BaseApplication) {
    this.app = app;
  }

  protected prepends() {
    return {};
  }

  protected request(
    endpoint: string,
    params: any = {},
    method = 'post',
    options: object = {},
    returnResponse = false,
  ): Promise<any> {
    if (!params.appid) {
      params.appid = this.app['config']['appid'];
    }
    if (!params.mch_id) {
      params.mch_id = this.app['config']['mchId'];
    }
    if (!params.nonce_str) {
      params.nonce_str = randomString(32);
    }
    const localParams = Merge(this.prepends(), params);

    if (!localParams.sign) {
      localParams['sign_type'] = localParams['sign_type'] || 'MD5';

      const secretKey = this.app['getKey'](endpoint);
      localParams['sign'] = makeSignature(
        localParams,
        secretKey,
        localParams['sign_type'],
      );
    }
    const XmlBuilder = new Xml2js.Builder({
      cdata: true,
      renderOpts: {
        pretty: false,
        indent: '',
        newline: '',
      },
    });
    const payload = Merge(options, {
      url: endpoint,
      method,
      body: XmlBuilder.buildObject(localParams),
    });

    return this.doRequest(payload, returnResponse)
      .then(async body => {
        if (!returnResponse) {
          try {
            body = await this.parseXml(body);
            if (body?.return_code === 'FAIL') {
              throw new Error(body?.return_msg);
            }
          } catch (e) {
            throw e;
          }
        }
        return body;
      })
      .catch(e => {
        throw e;
      });
  }

  async parseXml(xml: string): Promise<any> {
    let res = await Xml2js.parseStringPromise(xml);
    res = singleItem(res);
    if (res['xml']) res = res['xml'];
    return res;
  }

  protected safeRequest(
    endpoint: string,
    params: object = {},
    method = 'post',
    options: object = {},
  ): Promise<any> {
    options = Merge(options, {
      agentOptions: {
        pfx: this.app['config']['cert'],
        passphrase: this.app['config']['mchId'],
      },
    });
    return this.request(endpoint, params, method, options);
  }

  protected async requestRaw(
    endpoint: string,
    params: object = {},
    method = 'post',
    options: object = {},
  ): Promise<any> {
    options['encoding'] = null;
    const res = await this.request(endpoint, params, method, options, true);
    const body = await RawBody(res);
    return new Response(body, res.statusCode, res.headers);
  }

  protected wrap(endpoint: string): string {
    return this.app['inSandbox']() ? `sandboxnew/${endpoint}` : endpoint;
  }

  async getServerIp() {
    if (!this.serverIp) {
      const res = await this.doRequest({
        baseUrl: '',
        url: 'https://api.ipify.org?format=json',
        method: 'GET',
      });
      if (res && res['ip']) {
        this.serverIp = res['ip'];
      }
    }

    return this.serverIp;
  }

  getClientIp() {
    return this.app['request'].getClientIp();
  }

  // Rewrite by HttpMixin
  async doRequest(payload: object, returnResponse = false): Promise<any> {}
}

applyMixins(BaseClient, [HttpMixin]);

export default BaseClient;
