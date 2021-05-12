import { PipeTransform, Injectable } from '@nestjs/common';
import { UtilHelperProvider } from '@shared/helper';

/**
 * @class SnakeToHumpPipe
 * @classdesc 下划线参数格式转驼峰
 */
@Injectable()
export class SnakeToHumpPipe implements PipeTransform<any> {
  async transform(value: any) {
    try {
      return UtilHelperProvider.snakeToHump(value);
    } catch (err) {
      throw new Error('Params snake to hump error!');
    }
  }
}
