'use strict';

import * as Url from 'url';
import { IncomingMessage } from 'http';
import RequestInterface from '../Contracts/RequestInterface';
import { isIp, parseQueryString, isObject, isString } from '../Utils';
import * as RawBody from 'raw-body';

export default class Request implements RequestInterface {
  protected _req: IncomingMessage = null;
  protected _uri = '';
  protected _method = '';
  protected _headers: object = {};
  protected _get: object = {};
  protected _post: object = {};
  protected _content: Buffer = null;
  protected _contentType = '';
  protected _ip = '';

  constructor(
    req: IncomingMessage = null,
    content: Buffer | object | string = null,
  ) {
    if (req) {
      this._req = req;

      this._uri = req.url;
      this._method = req.method.toUpperCase();
      this._headers = req.headers || {};
      this._contentType = this._headers['content-type'] || '';

      if (Buffer.isBuffer(content)) {
        this._content = content;
      } else if (isObject(content)) {
        this._post = <object>content;
      } else if (isString(content)) {
        try {
          this._post = JSON.parse(<string>content);
        } catch (e) {
          this._post = parseQueryString(<string>content);
        }
      }

      this._get = Url.parse(req.url, true).query;

      // 提取请求ip
      if (isIp(this._headers['x-client-ip'])) {
        this._ip = this._headers['x-client-ip'];
      } else if (this._headers['x-forwarded-for']) {
        let ip = '';

        const items = this._headers['x-forwarded-for'].split(',');
        for (let i = 0; i < items.length; i++) {
          if (!items[i]) continue;

          ip = items[i].trim();
          if (items[i].indexOf(':') > -1) {
            const tmp = items[i].split(':');
            if (tmp.length == 2) {
              ip = tmp[0];
            }
          }
          if (isIp(ip)) {
            break;
          }
        }
        this._ip = ip;
      } else if (isIp(this._headers['x-real-ip'])) {
        this._ip = this._headers['x-real-ip'];
      } else if (isIp(this._headers['x-forwarded'])) {
        this._ip = this._headers['x-forwarded'];
      } else if (isIp(this._headers['forwarded-for'])) {
        this._ip = this._headers['forwarded-for'];
      } else if (isIp(this._headers['client-ip'])) {
        this._ip = this._headers['client-ip'];
      }
    }
  }

  isValid(): boolean {
    return !!this._req;
  }

  getMethod(): string {
    if (!this.isValid)
      throw new Error(
        "Please set request first. app.rebind('request', new EasyWechat.Request(ctx.req));",
      );
    return this._method;
  }

  get(key: string): Promise<any> {
    if (!this.isValid)
      throw new Error(
        "Please set request first. app.rebind('request', new EasyWechat.Request(ctx.req));",
      );
    if (this._get[key]) return this._get[key];
    return this.post(key);
  }

  async post(key: string): Promise<any> {
    if (!this.isValid)
      throw new Error(
        "Please set request first. app.rebind('request', new EasyWechat.Request(ctx.req));",
      );
    if (this._method !== 'POST') return null;
    if (!this._content) {
      this._content = await this.getContent();
    }
    if (!this._post && this._content) {
      const contentType = (this._headers['content-type'] || '').toLowerCase();
      if (contentType.indexOf('application/json') > -1) {
        try {
          this._post = JSON.parse(this._content.toString());
        } catch (e) {}
      } else if (
        contentType.indexOf('application/x-www-form-urlencoded') > -1
      ) {
        this._post = parseQueryString(this._content.toString());
      }
    }
    return this._post && this._post[key] ? this._post[key] : null;
  }

  async getContent(): Promise<Buffer> {
    if (!this.isValid)
      throw new Error(
        "Please set request first. app.rebind('request', new EasyWechat.Request(ctx.req));",
      );
    if (this._method !== 'POST') return null;
    if (!this._content) {
      this._content = await RawBody(this._req);
    }
    return this._content;
  }

  getUri(): string {
    if (!this.isValid)
      throw new Error(
        "Please set request first. app.rebind('request', new EasyWechat.Request(ctx.req));",
      );
    return this._uri || '';
  }

  getContentType(): string {
    if (!this.isValid)
      throw new Error(
        "Please set request first. app.rebind('request', new EasyWechat.Request(ctx.req));",
      );
    return this._contentType || '';
  }

  getHeaders(): object {
    if (!this.isValid)
      throw new Error(
        "Please set request first. app.rebind('request', new EasyWechat.Request(ctx.req));",
      );
    return this._headers || {};
  }

  getClientIp(): string {
    if (!this.isValid)
      throw new Error(
        "Please set request first. app.rebind('request', new EasyWechat.Request(ctx.req));",
      );
    return this._ip;
  }
}
