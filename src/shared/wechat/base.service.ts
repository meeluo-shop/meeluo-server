import { Factory } from '@library/easyWechat';
import { createHash } from '@library/easyWechat/Core/Utils';
import BaseApplication from '@library/easyWechat/BaseService/Application';
import { Injectable, Inject } from '@nestjs/common';
import { WechatCacheService } from './common/cache.service';
import { UtilHelperProvider } from '@shared/helper';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';

export interface WechatBaseApplicationConfig {
  appid: string;
  secret: string;
}

interface AppMapItem {
  [key: string]: BaseApplication;
}

@Injectable()
export class WechatBaseApplicationService {
  private static accountList = new Map<string, AppMapItem>();
  private logger: () => void;

  constructor(
    @InjectLogger(WechatBaseApplicationService)
    private loggerService: LoggerProvider,
    @Inject(WechatCacheService)
    private cacheService: WechatCacheService,
  ) {
    this.logger = () => (...args) =>
      this.loggerService.info(
        args
          .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
          .join(':'),
      );
  }

  private getId(config: WechatBaseApplicationConfig): string {
    return createHash(JSON.stringify(config), 'md5');
  }

  private putAccount(
    key: string,
    instanceId: string,
    account: BaseApplication,
  ) {
    WechatBaseApplicationService.accountList.set(key, {
      [instanceId]: account,
    });
  }

  getAccount(config: WechatBaseApplicationConfig) {
    const accountList = WechatBaseApplicationService.accountList;
    const instanceId = this.getId(config);
    const appItem = accountList.get(config.appid) || {};
    if (appItem[instanceId]) {
      return appItem[instanceId];
    }
    const account = new Factory.BaseService(
      UtilHelperProvider.humpToSnake(config),
    );
    this.rebind(account);
    this.putAccount(config.appid, instanceId, account);
    return account;
  }

  private rebind(account: BaseApplication) {
    account.rebind('cache', this.cacheService);
    account.rebind('log', this.logger);
  }
}
