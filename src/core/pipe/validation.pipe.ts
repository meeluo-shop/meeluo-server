import * as lodash from 'lodash';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ParamValidateException } from '@jiaxinjiang/nest-exception';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';

/**
 * @class ValidationPipe
 * @classdesc 验证所有使用 class-validator 的地方的 class 模型
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  constructor(@InjectLogger(ValidationPipe) private logger: LoggerProvider) {}

  private getError(errors: ValidationError[]) {
    let errorMessage: string;
    for (const error of errors) {
      errorMessage = lodash.values(error.constraints).reverse()[0];
      return errorMessage ? errorMessage : this.getError(error.children || []);
    }
    return errorMessage;
  }

  async transform(value: any, { metatype }: ArgumentMetadata) {
    // 这里用来过滤用户身份认证信息
    const logValue = value?.token && value?.user?.id ? value.user : value;
    this.logger.log(`Request parameters: ${JSON.stringify(logValue || {})}`);
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    let object = plainToClass(metatype, value);
    if (!object) {
      object = new metatype();
    }
    const errors = await validate(object, {
      whitelist: true,
      forbidUnknownValues: true,
    });
    if (errors.length) {
      const errorMessage = this.getError(errors);
      throw new ParamValidateException({
        msg: errorMessage,
        error: errorMessage,
      });
    }
    return object;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find(type => metatype === type);
  }
}
