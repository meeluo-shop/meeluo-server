import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@jiaxinjiang/nest-config';
import { LoggerProvider } from '@jiaxinjiang/nest-logger';
import { JwtModule, JwtOption } from '@jiaxinjiang/nest-jwt';

@Global()
@Module({})
export class JwtPackingModule {
  static forRootAsync(): DynamicModule {
    return {
      module: JwtPackingModule,
      imports: [
        JwtModule.forRootAsync({
          useFactory: (
            configService: ConfigService,
            logger: LoggerProvider,
          ) => {
            const options: JwtOption = configService.get('jwt');
            options.logger = logger.setContext('JwtModule');
            return options;
          },
          inject: [ConfigService, LoggerProvider],
        }),
      ],
      exports: [JwtModule],
    };
  }
}
