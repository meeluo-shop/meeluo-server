import { Factory } from '@library/easyWechat';
import { createHash } from '@library/easyWechat/Core/Utils';
import Payment from '@library/easyWechat/Payment/Application';
import { Injectable, Inject } from '@nestjs/common';
import { WechatCacheService } from './common/cache.service';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';

export interface WechatPaymentConfig {
  // 必要配置
  appid: string;
  mchId: string;
  key: string; // API 密钥
  notifyUrl: string;
  [key: string]: any;
}

interface PaymentMapItem {
  [key: string]: Payment;
}

@Injectable()
export class WechatPaymentService {
  private static accountList = new Map<string, PaymentMapItem>();
  private logger: () => void;

  constructor(
    @InjectLogger(WechatPaymentService)
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

  private getId(config: WechatPaymentConfig): string {
    return createHash(JSON.stringify(config), 'md5');
  }

  private putAccount(key: string, instanceId: string, account: Payment) {
    WechatPaymentService.accountList.set(key, { [instanceId]: account });
  }

  getAccount(config: WechatPaymentConfig) {
    const accountList = WechatPaymentService.accountList;
    const instanceId = this.getId(config);
    const appItem = accountList.get(config.appId) || {};
    if (appItem[instanceId]) {
      return appItem[instanceId];
    }
    const account = new Factory.Payment(config);
    this.rebind(account);
    this.putAccount(config.appId, instanceId, account);
    return account;
  }

  private rebind(account: Payment) {
    account.rebind('cache', this.cacheService);
    account.rebind('log', this.logger);
  }
}
