'use strict';

export default class CacheInterface {
  async get(id: string): Promise<any> {
    return null;
  }

  async has(id: string): Promise<boolean> {
    return false;
  }

  async set(id: string, data: any = null, lifeTime = 0): Promise<boolean> {
    return false;
  }

  async delete(id: string): Promise<boolean> {
    return false;
  }
}
