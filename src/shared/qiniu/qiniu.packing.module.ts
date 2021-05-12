import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@jiaxinjiang/nest-config';
import { LoggerProvider } from '@jiaxinjiang/nest-logger';
import { QiniuModule } from './qiniu.module';
import { QiniuOption } from './qiniu.interface';

@Global()
@Module({})
export class QiniuPackingModule {
  static forRootAsync(): DynamicModule {
    return {
      module: QiniuPackingModule,
      imports: [
        QiniuModule.forRootAsync({
          useFactory: (
            configService: ConfigService,
            logger: LoggerProvider,
          ) => {
            const options: QiniuOption[] = configService.get('qiniu');
            return options.map(option => {
              const { bucket } = option;
              option.logger = logger.setContext(`QiniuModule-${bucket}`);
              return option;
            });
          },
          inject: [ConfigService, LoggerProvider],
        }),
      ],
      exports: [QiniuModule],
    };
  }
}
