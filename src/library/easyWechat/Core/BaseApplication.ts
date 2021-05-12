'use strict';

import { Merge } from '../Core/Merge';
import CacheInterface from './Contracts/CacheInterface';
import FileCache from './Cache/FileCache';
import { createHash, isObject, isFunction } from './Utils';
import Request from './Http/Request';

export default class BaseApplicatioin {
  protected defaultConfig: Record<string, any> = {};
  protected userConfig: Record<string, any> = {};
  protected id: string = null;

  /**
   * 缓存实例
   */
  public cache: CacheInterface = null;
  /**
   * 配置
   */
  public config: Record<string, any> = {};
  /**
   * 日志方法
   */
  public log: Function = null;
  /**
   * 请求实例
   */
  public request: Request = null;

  constructor(
    config: Record<string, any> = {},
    prepends: Record<string, any> = {},
    id: string = null,
  ) {
    if (new.target === BaseApplicatioin) {
      throw new Error('Can not create instance via BaseApplicatioin.');
    }
    if (isObject(prepends)) {
      for (const key in prepends) {
        this.offsetSet(key, prepends[key]);
      }
    }
    this.userConfig = config || {};
    this.id = id || null;
  }

  getId(): string {
    if (!this.id) {
      this.id = createHash(JSON.stringify(this.userConfig), 'md5');
    }
    return this.id;
  }

  /**
   * 获取合并后的配置
   */
  getConfig(): Record<string, any> & { appid: string; secret: string } {
    const base = {
      // https://www.npmjs.com/package/request#requestoptions-callback
      http: {
        timeout: 30000,
        baseUrl: 'https://api.weixin.qq.com/',
      },
    };

    return Merge(base, this.defaultConfig, this.userConfig);
  }

  /**
   * 注册通用模块
   */
  registerCommonProviders(): void {
    this.offsetSet('config', function(app) {
      return app.getConfig();
    });

    this.log = function() {
      const args = arguments;
      args[0] = 'NodeEasywechat2: ' + args[0];
      return console.log.apply(null, arguments);
    };

    if (!this.request) {
      this.request = new Request();
    }
  }

  /**
   * 自定义服务模块（重新绑定）
   * @param id 服务模块的id，如：cache、request、accessToken
   * @param value 自定义服务模块的实例，可以传入一个闭包，闭包会接收一个指向Application的参数
   */
  rebind(id: string, value: any): void {
    this.offsetUnset(id);
    this.offsetSet(id, value);
  }

  /**
   * 解绑自定义服务模块
   * @param id 服务模块的id，如：cache、request、accessToken
   * @param value 自定义服务模块的实例
   */
  offsetUnset(id: string): void {
    delete this[id];
  }

  /**
   * 绑定自定义服务模块
   * @param id 服务模块的id，如：cache、request、accessToken
   * @param value 自定义服务模块的实例，可以传入一个闭包，闭包会接收一个指向Application的参数
   */
  offsetSet(id: string, value: any): void {
    if (isFunction(value)) {
      value = value(this);
    }
    this[id] = value;
  }

  /**
   * 获取cache实例
   */
  getCache(): any {
    if (this.cache) {
      return this.cache;
    }

    return (this.cache = this.createDefaultCache());
  }

  /**
   * 生成默认的缓存实例（文件缓存）
   */
  createDefaultCache(): FileCache {
    return new FileCache(this.config['file_cache'] || {});
  }
}
