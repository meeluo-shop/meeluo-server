import { Module, DynamicModule, Global } from '@nestjs/common';
import { LoggerProvider } from '@jiaxinjiang/nest-logger';
import { ConfigService } from '@jiaxinjiang/nest-config';
import { OrmModule, OrmConfig } from '@jiaxinjiang/nest-orm';

@Global()
@Module({})
export class OrmPackingModule {
  static forRootAsync(dbName: string): DynamicModule {
    return {
      module: OrmModule,
      imports: [
        OrmModule.forRootAsync({
          name: dbName,
          useFactory: (
            configService: ConfigService,
            logger: LoggerProvider,
          ) => {
            const databaseConfig = configService.get('database') || [];
            const options: OrmConfig = databaseConfig.find(
              item => item.name === dbName,
            );
            if (!options) {
              throw new Error(`Not found database(${dbName}) config`);
            }
            options.nestLogger = logger.setContext('NestTypeOrm');
            return options;
          },
          inject: [ConfigService, LoggerProvider],
        }),
      ],
      exports: [OrmModule],
    };
  }
}
