import { SnakeNamingStrategy, OrmConfig } from '@jiaxinjiang/nest-orm';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import globalConfig from './global.config';
import { OrmService } from '@typeorm/orm.service';

const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
} = process.env;

const baseConfig = {
  env: globalConfig.env,
  rootDir: globalConfig.rootDir,
  migrationsRun: false,
  synchronize: false,
  logging: 'all',
  maxQueryExecutionTime: 1000, // 慢查询记录
  namingStrategy: new SnakeNamingStrategy(),
  extra: {
    connectionLimit: 10,
  },
  serviceClass: OrmService,
};

export default [
  {
    ...baseConfig,
    name: MEELUO_SHOP_DATABASE,
    type: 'mysql',
    charset: 'utf8mb4_unicode_ci',
    host: DATABASE_HOST,
    port: DATABASE_PORT || 3306,
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: MEELUO_SHOP_DATABASE,
    entityPrefix: 'meeluo_',
    entities: [
      'app/**/*.entity.ts',
      'typeorm/meeluoShop/entity/**/*.entity.{ts,js}',
    ],
  },
] as OrmConfig[];
