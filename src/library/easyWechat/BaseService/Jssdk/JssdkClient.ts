'use strict';

import BaseClient from '../../Core/BaseClient';
import { Merge } from '../../Core/Merge';
import { randomString, getTimestamp, createHash } from '../../Core/Utils';

export default class Client extends BaseClient {
  protected url = '';
  protected ticketEndpoint = 'cgi-bin/ticket/getticket';

  /**
   * 获取签名凭证api_ticket
   * @param refresh 是否强制刷新
   * @param type 类型，默认：jsapi
   */
  async getTicket(refresh = false, type = 'jsapi'): Promise<string> {
    const cacheKey = `easywechat.basic_service.jssdk.ticket.${type}.${this.getAppId()}`;

    const cacher = this.app.getCache();
    if (!refresh && (await cacher.has(cacheKey))) {
      const ticket = await cacher.get(cacheKey);
      if (ticket) return ticket;
    }
    const res = await this.request({
      url: this.ticketEndpoint,
      method: 'get',
      qs: {
        type,
      },
    });
    await cacher.set(cacheKey, res, res['expires_in'] - 500);
    if (!cacher.has(cacheKey)) {
      throw new Error('Failed to cache jssdk ticket.');
    }
    return res;
  }

  /**
   * 获取JSSDK的配置
   * @param {Array<string>} jsApiList API列表
   * @param {Boolean} debug 是否调试模式，默认：false
   * @param {Boolean} beta 是否测试模式，默认：false
   * @param {Boolean} json true时返回JSON字符串，默认：false
   * @param {Array<string>} openTagList 开放标签列表，默认：[]
   * @param {string} url 请求URL，默认：当前URL
   */
  async buildConfig(
    jsApiList: Array<string>,
    debug = false,
    beta = false,
    json = false,
    openTagList: Array<string> = [],
    url = '',
  ): Promise<any> {
    const config = Merge(
      {
        jsApiList,
        debug,
        beta,
        openTagList,
      },
      await this.configSignature(url),
    );

    return json ? JSON.stringify(config) : config;
  }

  /**
   * 获取JSSDK的配置对象
   * @param {Array<string>} jsApiList API列表
   * @param {Boolean} debug 是否调试模式，默认：false
   * @param {Boolean} beta 是否测试模式，默认：false
   * @param {Array<string>} openTagList 开放标签列表，默认：[]
   * @param {string} url 请求URL，默认：当前URL
   */
  getConfigArray(
    jsApiList: Array<string>,
    debug = false,
    beta = false,
    openTagList: Array<string> = [],
    url = '',
  ): Promise<any> {
    return this.buildConfig(jsApiList, debug, beta, false, openTagList, url);
  }

  /**
   * 获取签名配置
   * @param {string} url 完整的URL地址
   * @param {string} nonce 随机字符串，默认：随机10位
   * @param {string} timestamp 时间戳，默认：当前时间
   */
  async configSignature(url = '', nonce = '', timestamp = ''): Promise<object> {
    url = url || this.getUrl();
    nonce = nonce || randomString(10);
    timestamp = timestamp || getTimestamp() + '';
    const ticket = await this.getTicket();

    return {
      appId: this.getAppId(),
      nonceStr: nonce,
      timestamp: timestamp,
      url: url,
      signature: this.getTicketSignature(
        ticket['ticket'],
        nonce,
        timestamp,
        url,
      ),
    };
  }

  protected getTicketSignature(
    ticket: string,
    nonce: string,
    timestamp: string,
    url: string,
  ): string {
    return createHash(
      `jsapi_ticket=${ticket}&noncestr=${nonce}&timestamp=${timestamp}&url=${url}`,
      'sha1',
    );
  }

  protected dictionaryOrderSignature(args: Array<string>): string {
    const params = [];
    for (const i in args) {
      params.push(args[i]);
    }
    params.sort();
    return createHash(params.join(''), 'sha1');
  }

  /**
   * 设置当前URL
   * @param {string} url 完整的URL地址
   */
  setUrl(url: string): object {
    this.url = url;

    return this;
  }

  /**
   * 获取当前设置的URL
   */
  getUrl(): string {
    return this.url;
  }

  /**
   * 获取配置中的appid
   */
  getAppId(): string {
    return this.app['config']['appid'];
  }
}
