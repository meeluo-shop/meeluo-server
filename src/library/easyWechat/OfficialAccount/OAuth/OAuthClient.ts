'use strict';

import BaseClient from '../../Core/BaseClient';
import { buildQueryString } from '../../Core/Utils';

export enum WechatAuthSnsApiTypeEnum {
  BASE = 'snsapi_base',
  USERINFO = 'snsapi_userinfo',
}

/**
 * OAuth授权后的用户对象
 */
export class User {
  /**
   * openid
   * @var {string}
   */
  id = '';
  /**
   * unionid
   * @var {string}
   */
  unionid = '';
  /**
   * 昵称
   * @var {string}
   */
  nickname = '';
  /**
   * 昵称
   * @var {string}
   */
  name = '';
  /**
   * 头像
   * @var {string}
   */
  avatar = '';
  /**
   * 原始数据
   * @var {object}
   */
  original: {
    openid: string;
    nickname: string;
    sex: 1 | 2 | 0;
    language: 'zh_CN' | 'zh_TW' | 'en';
    city: string;
    province: string;
    country: string;
    headimgurl: string;
    privilege: any[];
    unionid: string;
  };
  /**
   * AccessToken
   * @var {AccessToken}
   */
  token: AccessToken = null;

  /**
   * 获取 openid
   * @return {string}
   */
  getId(): string {
    return this.id;
  }

  /**
   * 获取 unionid
   * @return {string}
   */
  getUnionId(): string {
    return this.unionid;
  }

  /**
   * 获取昵称
   * @return {string}
   */
  getNickname(): string {
    return this.nickname;
  }

  /**
   * 获取昵称
   * @return {string}
   */
  getName(): string {
    return this.name;
  }

  /**
   * 获取头像
   * @return {string}
   */
  getAvatar(): string {
    return this.avatar;
  }

  /**
   * 获取原始数据
   * @return {object}
   */
  getOriginal(): object {
    return this.original;
  }

  /**
   * 获取AccessToken
   * @return {AccessToken}
   */
  getToken(): AccessToken {
    return this.token;
  }
}

/**
 * OAuth授权后的AccessToken对象
 */
export class AccessToken {
  constructor(info) {
    this.access_token = info.access_token;
    this.expires_in = info.expires_in;
    this.refresh_token = info.refresh_token;
    this.openid = info.openid;
    this.scope = info.scope;
  }

  /**
   * 网页授权接口调用凭证
   * @var {string}
   */
  access_token = '';
  /**
   * 调用凭证的超时时间，单位（秒）
   * @var {number}
   */
  expires_in = 0;
  /**
   * 刷新access_token
   * @var {string}
   */
  refresh_token = '';
  /**
   * 用户唯一标识，openid
   * @var {string}
   */
  openid = '';
  /**
   * 授权的作用域
   * @var {string}
   */
  scope: string = null;
}

/**
 * OAuth客户端
 */
export default class OAuthClient extends BaseClient {
  protected _scope = 'snsapi_userinfo';
  protected _callback = '';
  protected _state = '';

  /**
   * 设置scope
   * @param scope 可选值：snsapi_userinfo、snsapi_base，默认：snsapi_userinfo
   */
  scopes(scope: string): OAuthClient {
    this._scope = scope || 'snsapi_userinfo';
    return this;
  }

  /**
   * 设置授权后的回调地址
   * @param callback 完整的URL地址
   */
  callback(callback: string): OAuthClient {
    this._callback = callback || '';
    return this;
  }

  /**
   * 设置state参数
   * @param state
   */
  state(state: string): OAuthClient {
    this._state = state || '';
    return this;
  }

  /**
   * 获取配置中的appid
   */
  getAppId(): string {
    return this.app['config']['appid'];
  }

  /**
   * 生成授权链接
   * @param callback 授权后的回调地址
   */
  redirect(callback: string = null): string {
    if (!this.app['config']['oauth']) {
      throw new Error('Please config `oauth` section');
    }
    const scope =
      this._scope || this.app['config']['oauth']['scope'] || 'snsapi_userinfo';
    if (!callback) {
      callback =
        this._callback || this.app['config']['oauth']['callback'] || '';
    }
    if (
      callback.substr(0, 7) !== 'http://' &&
      callback.substr(0, 8) !== 'https://'
    ) {
      throw new Error(
        'Please set callback url start with "http://" or "https://"',
      );
    }

    const params = {
      appid: this.getAppId(),
      redirect_uri: callback,
      response_type: 'code',
      scope: scope,
      state: '',
    };
    if (this._state) {
      params.state = this._state;
    }

    return (
      'https://open.weixin.qq.com/connect/oauth2/authorize?' +
      buildQueryString(params) +
      '#wechat_redirect'
    );
  }

  /**
   * 获取授权后的token
   */
  async getToken(code: string): Promise<AccessToken> {
    const res = await this.doRequest({
      url: '/sns/oauth2/access_token',
      method: 'GET',
      qs: {
        appid: this.getAppId(),
        secret: this.app['config']['secret'],
        code,
        grant_type: 'authorization_code',
      },
    });
    if (!res || res['errcode']) {
      this.app['log']('Fail to fetch access_token', res);
      const err: any = new Error(res?.errmsg || 'Fail to fetch access_token');
      err.name = 'WeChatAPIError';
      err.code = res['errcode'];
      throw err;
    }
    return new AccessToken(res);
  }

  /**
   * 根据code获取用户信息
   * @param code 授权后回调地址带回的code
   */
  async user(
    code: string,
    scope: WechatAuthSnsApiTypeEnum = WechatAuthSnsApiTypeEnum.BASE,
  ): Promise<User> {
    const token: AccessToken = await this.getToken(code);
    const user = new User();
    user.id = token['openid'];
    user.token = token;

    if (scope != 'snsapi_base') {
      const params = {
        access_token: token.access_token,
        openid: user.id,
        lang: 'zh_CN',
      };
      const res = await this.httpGet('/sns/userinfo', params);
      if (res && !res['errcode']) {
        user.unionid = res['unionid'] || '';
        user.nickname = res['nickname'];
        user.name = res['nickname'];
        user.avatar = res['headimgurl'];
        user.original = res;
      }
    }

    return user;
  }
}
