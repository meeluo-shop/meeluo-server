import { CacheInterface } from '@library/easyWechat';
import { Injectable, Inject } from '@nestjs/common';
import { CacheProvider } from '@jiaxinjiang/nest-redis';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';

@Injectable()
export class WechatCacheService extends CacheInterface {
  @Inject(CacheProvider)
  private cacheService: CacheProvider;
  @InjectLogger(WechatCacheService)
  private logger: LoggerProvider;

  async get(id) {
    if (!this.cacheService) return false;
    let content = null;
    try {
      content = JSON.parse(await this.cacheService.get(id));
    } catch (e) {
      this.logger.error(e);
      return false;
    }
    return content;
  }

  async has(id) {
    if (!this.cacheService) return false;
    try {
      const res = await this.cacheService.exists(id);
      return res === 1;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  async set(id, data = null, lifeTime = 0) {
    if (!this.cacheService || data.errcode) return false;
    try {
      if (lifeTime > 0) {
        await this.cacheService.set(id, JSON.stringify(data), {
          ttl: lifeTime,
        });
      } else {
        await this.cacheService.set(id, JSON.stringify(data));
      }
    } catch (e) {
      this.logger.error(e);
      return false;
    }
    return true;
  }

  async delete(id) {
    if (!this.cacheService) return false;
    try {
      await this.cacheService.del(id);
      return true;
    } catch (e) {
      return false;
    }
  }
}
