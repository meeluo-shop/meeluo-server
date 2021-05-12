import { Provider } from '@nestjs/common';
import { AsyncConfigOptions, ConfigOptions } from './yilian.interface';
import { YILIAN_OPTION } from './yilian.constant';

export function createYiLianOptionsProvider(
  options: ConfigOptions,
): Provider<ConfigOptions> {
  return {
    provide: YILIAN_OPTION,
    useValue: options,
  };
}

export function createYiLianAsyncOptionsProvider(
  options: AsyncConfigOptions,
): Provider {
  return {
    provide: YILIAN_OPTION,
    useFactory: options.useFactory,
    inject: options.inject || [],
  };
}
