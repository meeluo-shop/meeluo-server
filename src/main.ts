import * as timeout from 'fastify-server-timeout';
import * as multer from 'fastify-multer';
import helmet from 'fastify-helmet';
import compress from 'fastify-compress';
import rateLimit from 'fastify-rate-limit';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@shared/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { LoggerProvider, requestContextPlugin } from '@jiaxinjiang/nest-logger';
import { ConfigService } from '@jiaxinjiang/nest-config';
import { patchSelectQueryBuilder } from '@jiaxinjiang/nest-orm';
import { SwaggerUtils } from '@shared/swagger';
import { HttpExceptionFilter } from '@jiaxinjiang/nest-exception';
import { ValidationPipe, SnakeToHumpPipe } from '@core/pipe';
import { LoggerMiddleware } from '@core/middleware';
import { TransformInterceptor } from '@core/interceptor';
import { AppModule } from '@app/app.module';

async function bootstrap() {
  // typeorm global-scope补丁
  patchSelectQueryBuilder();
  const urlPrefix = 'api';
  const adapter = new FastifyAdapter();
  const nestApp = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );
  const configService = nestApp.get(ConfigService);
  const validationPipe = nestApp.get(ValidationPipe);
  const snakeToHumpPipe = nestApp.get(SnakeToHumpPipe);
  const loggerMiddleware = nestApp.get(LoggerMiddleware);
  const httpExceptionFilter = nestApp.get(HttpExceptionFilter);
  const transformInterceptor = nestApp.get(TransformInterceptor);
  const loggerService = (await nestApp.resolve(LoggerProvider)).setContext(
    'NestApplication',
  );
  const serverPort = configService.get('port');
  nestApp.enableShutdownHooks();
  // 设置跨域，可具体传参配置
  nestApp.enableCors(configService.get('cors'));
  // 设置全局前缀
  nestApp.setGlobalPrefix(urlPrefix);
  // 设置全局logger
  nestApp.useLogger(loggerService);
  // 设置全局中间件
  nestApp.use(loggerMiddleware.callUse());
  // 捕获全局错误
  nestApp.useGlobalFilters(httpExceptionFilter);
  // 设置全局拦截器
  nestApp.useGlobalInterceptors(transformInterceptor);
  // 设置全局管道
  nestApp.useGlobalPipes(snakeToHumpPipe, validationPipe);
  // 安全防护
  adapter.register(helmet);
  // 日志请求id
  adapter.register(requestContextPlugin);
  // 上传文件类型
  adapter.register(multer.contentParser);
  // xml请求解析
  // eslint-disable-next-line
  adapter.register(require('fastify-xml-body-parser'));
  // 压缩请求
  adapter.register(compress);
  // 设置响应超时时间
  adapter.register(timeout, {
    serverTimeout: 10000, // ms
  });
  // 限制访问频率，多实例建议走redis
  adapter.register(rateLimit, {
    max: 200,
    timeWindow: 1000, // 一秒钟
  });
  // 生产环境不开放swagger
  // if (!configService.isProd()) {
  // 设置Swagger文档
  const {
    bearerAuth,
    title,
    description,
    version,
    urlPath,
  } = configService.get('swagger');
  const options = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth({ ...bearerAuth })
    .build();
  const document = SwaggerModule.createDocument(nestApp, options);
  SwaggerUtils.humpToSnake(document);
  SwaggerModule.setup(urlPath, nestApp, document);
  // }
  await nestApp.listen(serverPort, '0.0.0.0');
  const url = await nestApp.getUrl();
  loggerService.log(`Nest server listen on ${url}`);
}
bootstrap();
