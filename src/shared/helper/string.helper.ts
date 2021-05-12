import { Injectable } from '@nestjs/common';

@Injectable()
export class StringHelperProvider {
  /**
   * 生成指定长度的随机字符串
   * @param size
   */
  static getRandomStr(size: number, type: 'int' | 'str' = 'str') {
    const base =
      '0123456789' +
      (type === 'int'
        ? ''
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
    let randomStr = '';
    for (let i = size; i > 0; --i) {
      randomStr += base[Math.floor(Math.random() * base.length)];
    }
    return randomStr;
  }
}
