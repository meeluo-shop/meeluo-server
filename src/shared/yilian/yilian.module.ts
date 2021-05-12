import { Module, Global } from '@nestjs/common';
import { ConfigOptions, AsyncConfigOptions } from './yilian.interface';
import { YiLianService } from './yilian.service';
import {
  createYiLianAsyncOptionsProvider,
  createYiLianOptionsProvider,
} from './yilian.provider';

@Global()
@Module({})
export class YiLianModule {
  static forRoot(options: ConfigOptions) {
    const optionsProvider = createYiLianOptionsProvider(options);
    const providers = [YiLianService, optionsProvider];
    return {
      module: YiLianModule,
      providers,
      exports: providers,
    };
  }

  static forRootAsync(options: AsyncConfigOptions) {
    const optionsProvider = createYiLianAsyncOptionsProvider(options);
    const providers = [YiLianService, optionsProvider];
    return {
      module: YiLianModule,
      providers,
      exports: providers,
    };
  }
}
