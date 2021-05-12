import { Provider } from '@nestjs/common';
import { RequestAsyncConfig, RequestConfig } from './http.interface';
import { HTTP_OPTION } from './http.constants';

export function createHttpOptionsProvider(
  httpOption: RequestConfig,
): Provider<RequestConfig> {
  return {
    provide: HTTP_OPTION,
    useValue: httpOption,
  };
}

export function createHttpAsyncOptionsProvider(
  options: RequestAsyncConfig,
): Provider {
  return {
    provide: HTTP_OPTION,
    useFactory: options.useFactory,
    inject: options.inject || [],
  };
}
