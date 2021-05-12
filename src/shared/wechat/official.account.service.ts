import { Factory } from '@library/easyWechat';
import { createHash } from '@library/easyWechat/Core/Utils';
import OfficialAccount from '@library/easyWechat/OfficialAccount/Application';
import { Injectable, Inject } from '@nestjs/common';
import { WechatCacheService } from './common/cache.service';
import { UtilHelperProvider } from '@shared/helper';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';

export interface WechatOfficialAccountConfig {
  appId: string;
  secret: string;
  token?: string;
  // EncodingAESKey
  aesKey?: string;
  http?: {
    timeout?: 30000;
  };
  // 网页授权认证
  oauth?: {
    // 网页授权类型
    scope: 'snsapi_userinfo' | 'snsapi_base';
    // 网页授权回调地址，完整的URL
    redirect?: string;
  };
  [key: string]: any;
}

interface AppMapItem {
  [key: string]: OfficialAccount;
}

@Injectable()
export class WechatOfficialAccountService {
  private static accountList = new Map<string, AppMapItem>();
  private logger: () => void;

  constructor(
    @InjectLogger(WechatOfficialAccountService)
    private loggerService: LoggerProvider,
    @Inject(WechatCacheService)
    private cacheService: WechatCacheService,
  ) {
    this.logger = () => (...args) =>
      this.loggerService.info(
        args
          .map(arg => {
            if (typeof arg === 'object') {
              try {
                const tmp = {
                  ...arg,
                };
                delete tmp.formData;
                return JSON.stringify(tmp);
              } catch (err) {
                return arg;
              }
            } else {
              return arg;
            }
          })
          .join(':'),
      );
  }

  private getId(config: WechatOfficialAccountConfig): string {
    return createHash(JSON.stringify(config), 'md5');
  }

  private putAccount(
    key: string,
    instanceId: string,
    account: OfficialAccount,
  ) {
    WechatOfficialAccountService.accountList.set(key, {
      [instanceId]: account,
    });
  }

  getAccount(config: WechatOfficialAccountConfig) {
    const accountList = WechatOfficialAccountService.accountList;
    const instanceId = this.getId(config);
    const appItem = accountList.get(config.appId) || {};
    if (appItem[instanceId]) {
      return appItem[instanceId];
    }
    const account = new Factory.OfficialAccount(
      UtilHelperProvider.humpToSnake({
        appid: config.appId,
        ...config,
      }),
    );
    this.rebind(account);
    this.putAccount(config.appId, instanceId, account);
    return account;
  }

  private rebind(account: OfficialAccount) {
    account.rebind('cache', this.cacheService);
    account.rebind('log', this.logger);
  }
}
