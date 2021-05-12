import {
  SnakeNamingStrategy,
  TypeOrmModuleOptions,
} from '@jiaxinjiang/nest-orm';

module.exports = {
  name: 'meeluo_shop',
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '111111',
  database: 'meeluo_shop',
  migrationsRun: false,
  synchronize: false,
  logging: 'all',
  maxQueryExecutionTime: 1500, // 慢查询记录
  entityPrefix: 'meeluo_',
  namingStrategy: new SnakeNamingStrategy(),
  entities: ['src/typeorm/meeluoShop/entity/**/*.entity.ts'],
  migrations: ['src/typeorm/meeluoShop/migration/**/*.ts'],
} as TypeOrmModuleOptions;
