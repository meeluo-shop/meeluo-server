import * as _ from 'lodash';
import * as moment from 'moment';
import { Injectable } from '@nestjs/common';

export interface IBatchTaskLimitOptions {
  task: Function;
  params: any[];
  limit: number;
  interval?: number;
  limitParamIndex?: number;
}

@Injectable()
export class UtilHelperProvider {
  /**
   * 延迟指定毫秒
   * @param delayTime 毫秒
   */
  static async sleep(delayTime = 0) {
    return new Promise(resolve => {
      setTimeout(() => resolve(true), delayTime);
    });
  }

  /**
   * 数组任务分割，延迟处理
   * @param param0
   */
  static async batchTaskLimit<T>({
    task,
    params,
    limit,
    limitParamIndex = 0,
    interval,
  }: IBatchTaskLimitOptions): Promise<void | T[]> {
    const result: any = [];
    const limitParam: any[] = params.splice(limitParamIndex, 1)[0];
    if (!Array.isArray(limitParam)) {
      throw new Error('目标参数不是数组类型');
    }
    if (limit < 1) {
      throw new Error('你脑子瓦特了吧！');
    }
    const tempArr: any[] = [];
    for (const index in limitParam) {
      const loop = Number(index) + 1;
      tempArr.push(limitParam[index]);
      if (
        (loop % limit === 0 || loop === limitParam.length) &&
        tempArr.length > 0
      ) {
        const newParams = [...params];
        newParams.splice(limitParamIndex, 0, tempArr);
        const resp = await task(...newParams);
        result.push(resp);
        tempArr.length = 0;
        await UtilHelperProvider.sleep(interval);
      }
    }
    return result;
  }

  static deepEach(target: any, callback: (p?: any) => any, depth = 10) {
    if (--depth < 0) {
      return;
    }
    if (_.isArray(target)) {
      target.forEach(item => UtilHelperProvider.deepEach(item, callback));
    } else {
      callback(target);
      for (const key in target) {
        if (target[key] && typeof target[key] === 'object') {
          UtilHelperProvider.deepEach(target[key], callback, depth - 1);
        }
      }
    }
    return target;
  }

  static snakeToHump<T = any>(target: T, depth = 10) {
    const temp = _.cloneDeep(target);
    return UtilHelperProvider._snakeToHump<T>(temp, depth);
  }

  private static _snakeToHump<T = any>(target: T, depth = 10) {
    if (--depth < 0) {
      return;
    }
    if (_.isArray(target)) {
      target.forEach(item => UtilHelperProvider._snakeToHump(item));
    } else {
      for (const key in target) {
        const newKey = _.camelCase(key);
        if (key !== newKey) {
          target[newKey] = target[key];
          delete target[key];
        }
        if (target[newKey] && typeof target[newKey] === 'object') {
          UtilHelperProvider._snakeToHump(target[newKey], depth - 1);
        }
      }
    }
    return target;
  }

  static humpToSnake<T = any>(target: T, depth = 10) {
    const temp = _.cloneDeep(target);
    return UtilHelperProvider._humpToSnake<T>(temp, depth);
  }

  private static _humpToSnake<T = any>(target: T, depth = 10) {
    if (--depth < 0) {
      return;
    }
    if (_.isArray(target)) {
      target.forEach(item => UtilHelperProvider._humpToSnake(item));
    } else {
      for (const key in target) {
        const newKey = _.snakeCase(key);
        if (key !== newKey) {
          target[newKey] = target[key];
          delete target[key];
        }
        if (target[newKey] && typeof target[newKey] === 'object') {
          UtilHelperProvider._humpToSnake(target[newKey], depth - 1);
        }
      }
    }
    return target;
  }

  /**
   * 驼峰转下划线
   * @param data
   */
  static bufferEncode(data): Buffer {
    if (typeof data === 'object' && data.constructor === Object) {
      return Buffer.from(JSON.stringify(UtilHelperProvider.humpToSnake(data)));
    }
    if (typeof data === 'string') {
      return Buffer.from(data);
    }
    return data;
  }

  /**
   * 下划线转驼峰
   * @param data
   */
  static bufferDecode(data: Buffer): object | string {
    try {
      return UtilHelperProvider.snakeToHump(JSON.parse(data.toString()));
    } catch (err) {}
    return data.toString();
  }

  /**
   * 生成订单号
   */
  static generateOrderNo() {
    const random = parseInt(
      String(Math.random() * (99999 - 10000 + 1) + 10000),
      10,
    );
    const date = moment()
      .locale('zh-cn')
      .format('YYYYMMDDHHmmss');
    return date + random;
  }
}
