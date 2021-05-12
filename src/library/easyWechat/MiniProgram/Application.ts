'use strict';

import BaseApplication from '../Core/BaseApplication';
import AccessToken from './Auth/AccessToken';
import AuthClient from './Auth/AuthClient';
import DataCubeClient from './DataCube/DataCubeClient';
import AppCodeClient from './AppCode/AppCodeClient';
import Encryptor from './Encryptor';
import Guard from '../OfficialAccount/Server/Guard';
import TemplateMessageClient from './TemplateMessage/TemplateMessageClient';
import CustomerServiceClient from '../OfficialAccount/CustomerService/CustomerServiceClient';
import UniformMessageClient from './UniformMessage/UniformMessageClient';
import ActivityMessageClient from './ActivityMessage/ActivityMessageClient';
import OpenDataClient from './OpenData/OpenDataClient';
import PluginClient from './Plugin/PluginClient';
import PluginDevClient from './Plugin/PluginDevClient';
import MiniProgramBase from './Base/MiniProgramBase';
import ExpressClient from './Express/ExpressClient';
import NearbyPoiClient from './NearbyPoi/NearbyPoiClient';
import OCRClient from '../OfficialAccount/OCR/OCRClient';
import SoterClient from './Soter/SoterClient';
import SubscribeMessageClient from './SubscribeMessage/SubscribeMessageClient';
import RealtimeLogClient from './RealtimeLog/RealtimeLogClient';
import SearchClient from './Search/SearchClient';
import MediaClient from '../BaseService/Media/MediaClient';
import ContentSecurityClient from '../BaseService/ContentSecurity/ContentSecurityClient';

export default class MiniProgram extends BaseApplication {
  public accessToken: AccessToken = null;
  public auth: AuthClient = null;
  public encryptor: Encryptor = null;
  public server: Guard = null;
  public dataCube: DataCubeClient = null;
  public appCode: AppCodeClient = null;
  public templateMessage: TemplateMessageClient = null;
  public customerService: CustomerServiceClient = null;
  public uniformMessage: UniformMessageClient = null;
  public activityMessage: ActivityMessageClient = null;
  public openData: OpenDataClient = null;
  public plugin: PluginClient = null;
  public pluginDev: PluginDevClient = null;
  public base: MiniProgramBase = null;
  public express: ExpressClient = null;
  public nearbyPoi: NearbyPoiClient = null;
  public ocr: OCRClient = null;
  public soter: SoterClient = null;
  public subscribeMessage: SubscribeMessageClient = null;
  public realtimeLog: RealtimeLogClient = null;
  public search: SearchClient = null;
  public media: MediaClient = null;
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
    if (!this.auth) {
      this.offsetSet('auth', function(app) {
        return new AuthClient(app);
      });
    }
    this.offsetSet('dataCube', function(app) {
      return new DataCubeClient(app);
    });
    this.offsetSet('appCode', function(app) {
      return new AppCodeClient(app);
    });
    if (!this.encryptor) {
      this.offsetSet('encryptor', function(app) {
        return new Encryptor(
          app.config['appid'],
          app.config['token'],
          app.config['aes_key'],
        );
      });
    }
    if (!this.server) {
      this.offsetSet('server', function(app) {
        const guard = new Guard(app);
        guard.push(async function(payload) {
          const str = app.request.get('echostr');
          if (str) {
            return str;
          }
        });
        return guard;
      });
    }
    this.offsetSet('templateMessage', function(app) {
      return new TemplateMessageClient(app);
    });
    this.offsetSet('customerService', function(app) {
      return new CustomerServiceClient(app);
    });
    this.offsetSet('uniformMessage', function(app) {
      return new UniformMessageClient(app);
    });
    this.offsetSet('activityMessage', function(app) {
      return new ActivityMessageClient(app);
    });
    this.offsetSet('openData', function(app) {
      return new OpenDataClient(app);
    });
    this.offsetSet('plugin', function(app) {
      return new PluginClient(app);
    });
    this.offsetSet('pluginDev', function(app) {
      return new PluginDevClient(app);
    });
    this.offsetSet('base', function(app) {
      return new MiniProgramBase(app);
    });
    this.offsetSet('express', function(app) {
      return new ExpressClient(app);
    });
    this.offsetSet('nearbyPoi', function(app) {
      return new NearbyPoiClient(app);
    });
    this.offsetSet('ocr', function(app) {
      return new OCRClient(app);
    });
    this.offsetSet('soter', function(app) {
      return new SoterClient(app);
    });
    this.offsetSet('subscribeMessage', function(app) {
      return new SubscribeMessageClient(app);
    });
    this.offsetSet('realtimeLog', function(app) {
      return new RealtimeLogClient(app);
    });
    this.offsetSet('search', function(app) {
      return new SearchClient(app);
    });

    // BaseService
    this.offsetSet('media', function(app) {
      return new MediaClient(app);
    });
    this.offsetSet('contentSecurity', function(app) {
      return new ContentSecurityClient(app);
    });
  }

  // map to `base` module
  getPaidUnionid(): Promise<any> {
    return this.base.getPaidUnionid.apply(this.base, arguments);
  }
}
