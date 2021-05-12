import { Module, Global } from '@nestjs/common';
import { QiniuOption, QiniuAsyncOption } from './qiniu.interface';
import { QiniuService } from './qiniu.service';
import { createQiniuServiceForDecorated } from './qiniu.decorator';
import {
  createQiniuAsyncOptionsProvider,
  createQiniuOptionsProvider,
} from './qiniu.provider';

@Global()
@Module({})
export class QiniuModule {
  static forRoot(options: QiniuOption[]) {
    const optionsProvider = createQiniuOptionsProvider(options);
    const decorated = createQiniuServiceForDecorated();
    const providers = [QiniuService, optionsProvider, ...decorated];
    return {
      module: QiniuModule,
      providers,
      exports: providers,
    };
  }

  static forRootAsync(options: QiniuAsyncOption) {
    const optionsProvider = createQiniuAsyncOptionsProvider(options);
    const decorated = createQiniuServiceForDecorated();
    const providers = [QiniuService, optionsProvider, ...decorated];
    return {
      module: QiniuModule,
      providers,
      exports: providers,
    };
  }
}
