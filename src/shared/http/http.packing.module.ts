import * as UUID from 'uuid-int';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@jiaxinjiang/nest-config';
import { LoggerProvider } from '@jiaxinjiang/nest-logger';
import { HttpModule } from './http.module';
import { RequestConfig } from './http.interface';

const generator = UUID(1);

@Global()
@Module({})
export class HttpPackingModule {
  static forRootAsync(): DynamicModule {
    return {
      module: HttpModule,
      imports: [
        HttpModule.forRootAsync({
          useFactory: (
            configService: ConfigService,
            logger: LoggerProvider,
          ) => {
            const options: RequestConfig = configService.get('http');
            options.logger = logger.setContext('HttpModule');
            if (!options.requestInterceptors) {
              options.requestInterceptors = [];
            }
            // header里追加请求id，供日志追踪查询
            options.requestInterceptors.push({
              onFulfilled: config => {
                config.headers['request-context-id'] =
                  logger.requestId || generator.uuid();
                return config;
              },
            });
            return options;
          },
          inject: [ConfigService, LoggerProvider],
        }),
      ],
      exports: [HttpModule],
    };
  }
}
