import { ApiProperty as Property, ApiPropertyOptions } from '@nestjs/swagger';
import { EnumHelperProvider } from '@shared/helper';
import { SetMetadata } from '@nestjs/common';
import { ApiNoContentResponse } from '@shared/swagger';
import { BaseExceptionConstructor } from '@jiaxinjiang/nest-exception';
import { HTTP_ERROR_RESPONSE } from './swagger.constant';

export function ApiProperty(
  options: ApiPropertyOptions = {},
): PropertyDecorator {
  if (options.enum) {
    options.enum = EnumHelperProvider.transformEnum(options.enum);
  }
  return Property(options);
}
/**
 * 异常响应装饰器
 * @exports ErrorResponse
 * @example @ErrorResponse(SystemException)
 */
export function ApiErrorResponse(
  exception: BaseExceptionConstructor,
): MethodDecorator {
  return (_, __, descriptor: PropertyDescriptor) => {
    SetMetadata<string, BaseExceptionConstructor>(
      HTTP_ERROR_RESPONSE,
      exception,
    )(descriptor.value);
    const err = new exception();
    ApiNoContentResponse({
      description: err.msg,
      type: exception,
    })(_, __, descriptor);
    return descriptor;
  };
}
