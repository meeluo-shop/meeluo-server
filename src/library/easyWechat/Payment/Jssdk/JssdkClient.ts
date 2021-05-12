'use strict';

import BaseClient from '../../BaseService/Jssdk/JssdkClient';
import { randomString, getTimestamp, makeSignature } from '../../Core/Utils';
import BaseAccessToken from '../../Core/BaseAccessToken';

export default class JssdkClient extends BaseClient {
  /**
   * 生成支付 JS 配置（WeixinJSBridge方式）
   * @param prepayId 通过统一下单（unify）接口获取
   * @param json 是否返回json字符串，默认：true
   */
  bridgeConfig(prepayId: string, json = true): any {
    const params = {
      appId: this.app['config']['subAppid']
        ? this.app['config']['subAppid']
        : this.app['config']['appid'],
      timeStamp: getTimestamp() + '',
      nonceStr: randomString(16),
      package: `prepay_id=${prepayId}`,
      signType: 'MD5',
    };

    params['paySign'] = makeSignature(params, this.app['config']['key'], 'md5');

    return json ? JSON.stringify(params) : params;
  }

  /**
   * 生成支付 JS 配置（JSSDK方式）
   * @param prepayId 通过统一下单（unify）接口获取
   */
  sdkConfig(prepayId: string): object {
    const config = this.bridgeConfig(prepayId, false);
    config['timestamp'] = config['timeStamp'];
    delete config['timeStamp'];

    return config;
  }

  /**
   * 生成 APP 支付配置
   * @param prepayId 通过统一下单（unify）接口获取
   */
  appConfig(prepayId: string): object {
    const params = {
      appid: this.app['config']['appid'],
      partnerid: this.app['config']['mchId'],
      prepayid: prepayId,
      noncestr: randomString(16),
      timestamp: getTimestamp() + '',
      package: 'Sign=WXPay',
    };

    params['sign'] = makeSignature(params, this.app['config']['key'], 'md5');

    return params;
  }

  /**
   * 生成共享收货地址 JS 配置
   * @param accessToken OAuth授权后的AccessToken
   * @param json 是否返回json字符串，默认：true
   */
  async shareAddressConfig(accessToken: any, json = true): Promise<any> {
    if (accessToken instanceof BaseAccessToken) {
      accessToken = await accessToken.getToken();
    }

    const params = {
      appId: this.app['config']['appid'],
      scope: 'jsapi_address',
      timeStamp: getTimestamp() + '',
      nonceStr: randomString(16),
      signType: 'SHA1',
    };

    const signParams = {
      appId: params['appId'],
      url: this.getUrl(),
      timestamp: params['timeStamp'],
      noncestr: params['nonceStr'],
      accesstoken: '' + accessToken,
    };

    params['addrSign'] = makeSignature(signParams, '', 'sha1');

    return json ? JSON.stringify(params) : params;
  }
}
