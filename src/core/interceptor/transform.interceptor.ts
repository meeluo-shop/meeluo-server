import { Reflector } from '@nestjs/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import {
  Injectable,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { UtilHelperProvider } from '@shared/helper';
import {
  BaseExceptionConstructor,
  SystemException,
} from '@jiaxinjiang/nest-exception';
import { HTTP_ERROR_RESPONSE } from '@shared/swagger';

/**
 * @class ErrorInterceptor
 * @classdesc 当控制器所需的 Promise service 发生错误时，错误将在此被捕获
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const call$ = next.handle();
    const target = context.getHandler();
    const exception =
      this.reflector.get<BaseExceptionConstructor>(
        HTTP_ERROR_RESPONSE,
        target,
      ) || SystemException;
    return call$.pipe(
      map((data: any) => {
        return {
          code: 0,
          msg: '请求成功',
          data: UtilHelperProvider.humpToSnake(data),
        };
      }),
      catchError(error => {
        const ignoreErrorList = ['QueryFailedError', 'WeChatAPIError'];
        const err =
          error.code && !ignoreErrorList.includes(error.name)
            ? error
            : new exception({
                error: error.error || error.message,
              });
        err.stack = error.stack;
        return throwError(err);
      }),
    );
  }
}
