import { Provider } from '@nestjs/common';
import { QiniuAsyncOption, QiniuOption } from './qiniu.interface';
import { QINIU_OPTION } from './qiniu.constant';

export function createQiniuOptionsProvider(
  options: QiniuOption[],
): Provider<QiniuOption[]> {
  return {
    provide: QINIU_OPTION,
    useValue: options,
  };
}

export function createQiniuAsyncOptionsProvider(
  options: QiniuAsyncOption,
): Provider {
  return {
    provide: QINIU_OPTION,
    useFactory: options.useFactory,
    inject: options.inject || [],
  };
}
