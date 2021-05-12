import { Module, HttpModule as HttpFetchModule, Global } from '@nestjs/common';
import { HttpFetchService } from './http.service';
import { RequestConfig, RequestAsyncConfig } from './http.interface';
import {
  createHttpAsyncOptionsProvider,
  createHttpOptionsProvider,
} from './http.provider';

@Global()
@Module({})
export class HttpModule {
  static forRoot(options: RequestConfig) {
    const optionsProvider = createHttpOptionsProvider(options);
    const providers = [HttpFetchService, optionsProvider];
    return {
      module: HttpModule,
      imports: [HttpFetchModule],
      providers,
      exports: providers,
    };
  }

  static forRootAsync(options: RequestAsyncConfig) {
    const optionsProvider = createHttpAsyncOptionsProvider(options);
    const providers = [HttpFetchService, optionsProvider];
    return {
      module: HttpModule,
      imports: [HttpFetchModule],
      providers,
      exports: providers,
    };
  }
}
