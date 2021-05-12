import { Injectable } from '@nestjs/common';

@Injectable()
export class ArrayHelperProvider {
  /**
   * 数组去重添加
   * @param target
   * @param item
   */
  static push<T = any>(target: Array<T>, item: T) {
    if (!target.includes(item)) {
      target.push(item);
      return true;
    }
    return false;
  }

  static relationHandle<
    Target extends Record<string, any>,
    Source extends Record<string, any>,
    Result = any
  >(
    targets: Target[],
    sources: Source[],
    targetKey: string,
    sourceKey: string,
    handler: (target: Target, source: Source | null) => Result | undefined,
    skipNullSoure = true,
  ): Result[] {
    const results: Result[] = [];
    targets.forEach(tItem => {
      const sItem = sources.find(item => item[sourceKey] === tItem[targetKey]);
      if (sItem === undefined && skipNullSoure) {
        return;
      }
      const ret = handler(tItem, sItem);
      if (ret !== undefined) {
        results.push(ret);
      }
    });
    return results;
  }
  /**
   * 从数组中筛选出指定的数据
   * @param array
   * @param fn
   */
  static filterProps<R>(
    array: Array<any>,
    fn: (item: any, key: number) => R | undefined,
  ): R[] {
    const values: R[] = [];
    for (const index in array) {
      const item: any = array[index];
      const ret = fn(item, Number(index));
      if (ret !== undefined && !values.includes(ret)) {
        values.push(ret);
      }
    }
    return values;
  }

  /**
   * 从一个数组里计算出连续数字
   * @param numbers
   */
  static continuousDigit(numbers: string | number[]): Array<number[]> {
    let group: number[] = [];
    const groups: Array<number[]> = [];
    if (typeof numbers === 'string') {
      numbers = numbers.split(',').map(Number);
    }
    if (numbers.length < 1) {
      return [];
    }
    numbers = numbers.sort((a, b) => a - b);
    group[0] = numbers[0];
    numbers.reduce((pre, next) => {
      if (next - pre > 1) {
        groups.push([...group]);
        group = [next];
      } else {
        group.push(next);
      }
      return next;
    });
    groups.push(group);
    return groups;
  }
}
