'use strict';

import BaseApplication from '../Core/BaseApplication';
import JssdkClient from './Jssdk/JssdkClient';
import MediaClient from './Media/MediaClient';
import QrcodeClient from './Qrcode/QrcodeClient';
import UrlClient from './Url/UrlClient';
import AccessToken from './Auth/AccessToken';
import ContentSecurityClient from './ContentSecurity/ContentSecurityClient';

export default class BaseService extends BaseApplication {
  protected defaultConfig: object = {
    appid: '',
    secret: '',
  };

  public accessToken: AccessToken = null;
  public jssdk: JssdkClient = null;
  public media: MediaClient = null;
  public qrcode: QrcodeClient = null;
  public url: UrlClient = null;
  public contentSecurity: ContentSecurityClient = null;

  constructor(
    config: Record<string, any> = {},
    prepends: Record<string, any> = {},
    id: string = null,
  ) {
    super(config, prepends, id);

    this.registerProviders();
  }

  registerProviders(): void {
    super.registerCommonProviders();

    if (!this.accessToken) {
      this.offsetSet('accessToken', function(app) {
        return new AccessToken(app);
      });
    }

    this.offsetSet('jssdk', function(app) {
      return new JssdkClient(app);
    });
    this.offsetSet('media', function(app) {
      return new MediaClient(app);
    });
    this.offsetSet('qrcode', function(app) {
      return new QrcodeClient(app);
    });
    this.offsetSet('url', function(app) {
      return new UrlClient(app);
    });
    this.offsetSet('contentSecurity', function(app) {
      return new ContentSecurityClient(app);
    });
  }
}
