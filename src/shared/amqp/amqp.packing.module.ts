import { DynamicModule, Global, Module } from '@nestjs/common';
import { AmqpModule, AmqpConfig } from '@jiaxinjiang/nest-amqp';
import { ConfigService } from '@jiaxinjiang/nest-config';
import { LoggerProvider } from '@jiaxinjiang/nest-logger';

@Global()
@Module({})
export class AmqpPackingModule {
  static forRootAsync(name: string): DynamicModule {
    return {
      module: AmqpModule,
      imports: [
        AmqpModule.forRootAsync({
          useFactory: async (
            configService: ConfigService,
            logger: LoggerProvider,
          ) => {
            const options: AmqpConfig = configService.get('amqp')[name];
            if (!options || !options.connection) {
              throw new Error('VHost config not found!');
            }
            if (!options.connection.vhost) {
              options.connection.vhost = name;
            }
            options.logger = logger.setContext('AmqpModule');
            return options;
          },
          inject: [ConfigService, LoggerProvider],
        }),
      ],
      exports: [AmqpModule],
    };
  }
}
