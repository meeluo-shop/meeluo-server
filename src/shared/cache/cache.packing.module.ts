import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@jiaxinjiang/nest-config';
import { LoggerProvider } from '@jiaxinjiang/nest-logger';
import { RedisCacheModule, CacheConfig } from '@jiaxinjiang/nest-redis';

@Global()
@Module({})
export class CachePackingModule {
  static forRootAsync(): DynamicModule {
    return {
      module: CachePackingModule,
      imports: [
        RedisCacheModule.forRootAsync({
          useFactory: (
            configService: ConfigService,
            logger: LoggerProvider,
          ) => {
            const options: CacheConfig = configService.get('redis');
            options.logger = logger.setContext('CacheModule');
            return options;
          },
          inject: [ConfigService, LoggerProvider],
        }),
      ],
      exports: [RedisCacheModule],
    };
  }
}
