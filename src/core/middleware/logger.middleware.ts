import * as UUID from 'uuid-int';
import { IncomingMessage } from 'http';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';

const generator = UUID(1);

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@InjectLogger(LoggerMiddleware) private logger: LoggerProvider) {}

  callUse() {
    return this.use.bind(this);
  }

  async use(request: IncomingMessage, response, next) {
    const now = Date.now();
    const uuid = String(generator.uuid());
    if (!request.headers['request-context-id']) {
      request.headers['request-context-id'] = uuid;
    }
    await next();
    this.logger.setContext(`${LoggerMiddleware.name}-${uuid}`);
    const content = `[${request.method}] ${response.statusCode} -> ${request.url}`;
    this.logger.log(`${content} (${Date.now() - now}ms)`);
  }
}
