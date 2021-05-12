import * as lodash from 'lodash';
import { PROPERTY_DEPS_METADATA } from '@nestjs/common/constants';
import { CacheProvider } from '@jiaxinjiang/nest-redis';
import { BaseExceptionConstructor } from '@jiaxinjiang/nest-exception';

/**
 * 给指定用户操作上锁
 * 注：被注解的方法必须传入ClientIdenity对象
 */
export function UserLock({
  prefix,
  ttl = 10,
  error,
}: {
  prefix: string;
  ttl?: number;
  error?: BaseExceptionConstructor;
}) {
  return (target, _, descriptor: PropertyDescriptor) => {
    let defaultProp = 'cacheProvider';
    let properties =
      Reflect.getMetadata(PROPERTY_DEPS_METADATA, target.constructor) || [];
    const cacheProperty = properties.find(
      item => item.type === CacheProvider.name,
    );
    if (!cacheProperty) {
      properties = [
        ...properties,
        { key: defaultProp, type: CacheProvider.name },
      ];
      Reflect.defineMetadata(
        PROPERTY_DEPS_METADATA,
        properties,
        target.constructor,
      );
    } else if (cacheProperty.key !== defaultProp) {
      defaultProp = cacheProperty.key;
    }
    const fn = descriptor.value;
    if (!lodash.isFunction(fn)) {
      return descriptor;
    }
    descriptor.value = async function(...args) {
      const identity: ClientIdentity = args.find(
        (arg: ClientIdentity) => arg?.userId && arg?.merchantId && arg.openid,
      );
      if (!identity) {
        throw new Error('该方法参数未传入`ClientIdentity`对象');
      }
      if (prefix.lastIndexOf(':') + 1 !== prefix.length) {
        prefix = prefix + ':';
      }
      const cacheProvider: CacheProvider = this[defaultProp];
      const cacheKey = `${prefix}${identity.merchantId}:${identity.userId}`;
      const status = await cacheProvider.setnx(cacheKey, 1, ttl);
      if (!status) {
        if (error) {
          throw new error();
        }
        throw new Error(`当前用户操作已被锁定，请等待${ttl}秒后，再继续操作`);
      }
      let data = undefined;
      try {
        data = await fn.apply(this, args);
      } catch (err) {
        throw err;
      } finally {
        await cacheProvider.del(cacheKey);
      }
      return data;
    };
    return descriptor;
  };
}
