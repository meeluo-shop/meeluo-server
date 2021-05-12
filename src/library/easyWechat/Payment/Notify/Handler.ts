'use strict';

import BaseApplicatioin from '../../Core/BaseApplication';
import { Merge } from '../../Core/Merge';
import * as Xml2js from 'xml2js';
import {
  makeSignature,
  AesDecrypt,
  createHash,
  singleItem,
} from '../../Core/Utils';
import Response from '../../Core/Http/Response';

export default class Handler {
  SUCCESS = 'SUCCESS';
  FAIL = 'FAIL';

  protected app: BaseApplicatioin = null;

  protected message: object = null;

  protected fail = '';

  protected attributes: object = {};

  protected check = true;

  protected sign = false;

  constructor(app: BaseApplicatioin) {
    this.app = app;
  }

  async handle(closure: Function): Promise<Response> {
    return null;
  }

  /**
   * 设置处理失败时的错误消息
   * @param message 错误消息
   */
  setFail(message: string): void {
    this.fail = message;
  }

  respondWith(attributes: object, sign = false): Handler {
    this.attributes = attributes;
    this.sign = sign;

    return this;
  }

  toResponse(): Response {
    const base = {
      return_code: this.fail ? this.FAIL : this.SUCCESS,
      return_msg: this.fail,
    };

    const attributes = Merge(base, this.attributes);

    if (this.sign) {
      attributes['sign'] = makeSignature(attributes, this.app['getKey']());
    }

    const XmlBuilder = new Xml2js.Builder({
      cdata: true,
      renderOpts: {
        pretty: false,
        indent: '',
        newline: '',
      },
    });
    return new Response(XmlBuilder.buildObject(attributes));
  }

  async getMessage(): Promise<object> {
    let message: object = null;
    try {
      const content = await this.app['request'].getContent();
      message = await this.parseXml(content.toString());
      this.app['log'](
        'Payment.Notify.Handler.getMessage',
        content.toString(),
        message,
      );
    } catch (e) {
      throw new Error('Invalid request XML: ' + e.message);
    }

    if (!message) {
      throw new Error('Invalid request XML.');
    }

    if (this.check) {
      this.validate(message);
    }

    return message;
  }

  async parseXml(xml: string): Promise<any> {
    let res = await Xml2js.parseStringPromise(xml);
    res = singleItem(res);
    if (res['xml']) res = res['xml'];
    return res;
  }

  async decryptMessage(key: string): Promise<string> {
    const message: object = await this.getMessage();
    if (!message[key]) {
      return null;
    }

    const buffer = Buffer.from(message[key], 'base64');

    return AesDecrypt(
      buffer.toString(),
      createHash(this.app['config']['key'], 'md5'),
      '',
      'AES-256-ECB',
    );
  }

  protected validate(message: object): void {
    const sign = message['sign'];

    if (makeSignature(message, this.app['getKey']()) !== sign) {
      throw new Error('Invalid Sign');
    }
  }

  protected strict(result: any): void {
    if (true !== result && this.fail === '') {
      this.fail = result;
    }
  }
}
