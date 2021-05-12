import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@jiaxinjiang/nest-config';
import { LoggerProvider } from '@jiaxinjiang/nest-logger';
import { YiLianModule } from './yilian.module';
import { ConfigOptions } from './yilian.interface';

@Global()
@Module({})
export class YiLianPackingModule {
  static forRootAsync(): DynamicModule {
    return {
      module: YiLianPackingModule,
      imports: [
        YiLianModule.forRootAsync({
          useFactory: (
            configService: ConfigService,
            logger: LoggerProvider,
          ) => {
            const options: ConfigOptions = configService.get('yilian');
            options.logger = logger.setContext(`YiLianModule`);
            return options;
          },
          inject: [ConfigService, LoggerProvider],
        }),
      ],
      exports: [YiLianModule],
    };
  }
}
