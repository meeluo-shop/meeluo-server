import { Factory } from '@library/easyWechat';
import { createHash } from '@library/easyWechat/Core/Utils';
import MiniProgram from '@library/easyWechat/MiniProgram/Application';
import { Injectable, Inject } from '@nestjs/common';
import { WechatCacheService } from './common/cache.service';
import { UtilHelperProvider } from '@shared/helper';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';

export interface WechatMiniProgramConfig {
  appid: string;
  secret: string;
  token?: string;
  // EncodingAESKey
  aesKey?: string;
  http?: {
    timeout?: 30000;
  };
  [key: string]: any;
}

interface AppMapItem {
  [key: string]: MiniProgram;
}

@Injectable()
export class WechatMiniProgramService {
  private static accountList = new Map<string, AppMapItem>();
  private logger: () => void;

  constructor(
    @InjectLogger(WechatMiniProgramService)
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

  private getId(config: WechatMiniProgramConfig): string {
    return createHash(JSON.stringify(config), 'md5');
  }

  private putAccount(key: string, instanceId: string, account: MiniProgram) {
    WechatMiniProgramService.accountList.set(key, { [instanceId]: account });
  }

  getAccount(config: WechatMiniProgramConfig) {
    const accountList = WechatMiniProgramService.accountList;
    const instanceId = this.getId(config);
    const appItem = accountList.get(config.appid) || {};
    if (appItem[instanceId]) {
      return appItem[instanceId];
    }
    const account = new Factory.MiniProgram(
      UtilHelperProvider.humpToSnake(config),
    );
    this.rebind(account);
    this.putAccount(config.appid, instanceId, account);
    return account;
  }

  private rebind(account: MiniProgram) {
    account.rebind('cache', this.cacheService);
    account.rebind('log', this.logger);
  }
}
