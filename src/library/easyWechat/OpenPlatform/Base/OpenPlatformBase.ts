'use strict';

import BaseClient from '../../Core/BaseClient';

export default class OpenPlatformBase extends BaseClient {
  /**
   * 使用授权码换取接口调用凭据和授权信息
   * @param authCode 授权码, 会在授权成功的回调返回给第三方平台
   */
  handleAuthorize(authCode: string = null): Promise<any> {
    return this.httpPostJson('cgi-bin/component/api_query_auth', {
      component_appid: this.app['config']['appid'],
      authorization_code: authCode || this.app['request'].get('auth_code'),
    });
  }

  /**
   * 获取授权方的帐号基本信息
   * @param appId 授权方appid
   */
  getAuthorizer(appId: string): Promise<any> {
    return this.httpPostJson('cgi-bin/component/api_get_authorizer_info', {
      component_appid: this.app['config']['appid'],
      authorizer_appid: appId,
    });
  }

  /**
   * 设置授权方的选项信息
   * @param appId 授权方appid
   * @param name 选项名称
   */
  getAuthorizerOption(appId: string, name: string): Promise<any> {
    return this.httpPostJson('cgi-bin/component/api_get_authorizer_option', {
      component_appid: this.app['config']['appid'],
      authorizer_appid: appId,
      option_name: name,
    });
  }

  /**
   * 设置授权方的选项信息
   * @param appId 授权方appid
   * @param name 选项名称
   * @param value 选项值
   */
  setAuthorizerOption(
    appId: string,
    name: string,
    value: string,
  ): Promise<any> {
    return this.httpPostJson('cgi-bin/component/api_set_authorizer_option', {
      component_appid: this.app['config']['appid'],
      authorizer_appid: appId,
      option_name: name,
      option_value: value,
    });
  }

  /**
   * 获取已授权的授权方列表
   * @param offset 起始位置，从0开始
   * @param count 获取记录数，最大500
   */
  getAuthorizers(offset = 0, count = 500): Promise<any> {
    return this.httpPostJson('cgi-bin/component/api_get_authorizer_list', {
      component_appid: this.app['config']['appid'],
      offset,
      count,
    });
  }

  /**
   * 获取预授权码
   */
  createPreAuthorizationCode(): Promise<any> {
    return this.httpPostJson('cgi-bin/component/api_create_preauthcode', {
      component_appid: this.app['config']['appid'],
    });
  }

  /**
   * 清零调用次数
   */
  clearQuota(): Promise<any> {
    return this.httpPostJson('cgi-bin/component/clear_quota', {
      component_appid: this.app['config']['appid'],
    });
  }
}
