import * as lodash from 'lodash';
import * as BcryptJs from 'bcrypt';
import * as CryptoJS from 'crypto-js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoHelperProvider {
  static keyStr = 'k;)*(+nmjdsf$#@d';

  static saltRounds = 10;

  static hash(password: string) {
    return BcryptJs.hashSync(password, CryptoHelperProvider.saltRounds);
  }

  static compare(password: string, EncryptedPassword: string) {
    return BcryptJs.compareSync(password, EncryptedPassword);
  }

  static encrypt(word) {
    const key = CryptoJS.enc.Utf8.parse(CryptoHelperProvider.keyStr);
    const srcs = CryptoJS.enc.Utf8.parse(word);
    return CryptoJS.AES.encrypt(srcs, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  }

  static decrypt(word) {
    const key = CryptoJS.enc.Utf8.parse(CryptoHelperProvider.keyStr);
    return CryptoJS.AES.decrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
  }

  static encryptPropertis<T>(target: T, fields: string[]) {
    for (const key in target) {
      if (fields.includes(key)) {
        target[key] = CryptoHelperProvider.encrypt(target[key]);
      }
    }
    return target;
  }

  static decryptPropertis<T>(target: T, fields: string[]) {
    for (const key in target) {
      if (fields.includes(key)) {
        target[key] = CryptoHelperProvider.decrypt(target[key]);
      }
    }
    return target;
  }

  static base64Decode(str: string) {
    const chars = "iRnAlpo9meXhujBgF5N8Uwtd4/sP0TIxJK+Mcz6OQkC3WLvYHEq1SfryD2Z7aVGb";
    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
      lookup[chars.charCodeAt(i)] = i;
    }

    let bufferLength = str.length * 0.75;
    let p = 0;

    if (str[str.length - 1] === "=") {
      bufferLength--;
      if (str[str.length - 2] === "=") {
        bufferLength--;
      }
    }
    const arraybuffer = new ArrayBuffer(bufferLength);
    const bytes = new Uint8Array(arraybuffer);

    for (let i = 0; i < str.length; i += 4) {
      const encoded1 = lookup[str.charCodeAt(i)];
      const encoded2 = lookup[str.charCodeAt(i + 1)];
      const encoded3 = lookup[str.charCodeAt(i + 2)];
      const encoded4 = lookup[str.charCodeAt(i + 3)];
      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
    const ret = Buffer.from(arraybuffer).toString();
    return ret.split('').reverse().join('')
  }

  /**
   * simpleDecrypto 解密程序
   * @param {Strng} str 待加密字符串
   * @param {Number} xor 异或值
   * @param {Number} hex 加密后的进制数
   * @return {Strng} 加密后的字符串
   */
  static simpleDecrypto(str: string, xor: number, hex: number) {
    if (
      !lodash.isString(str) ||
      !lodash.isNumber(xor) ||
      !lodash.isNumber(hex)
    ) {
      return;
    }
    const resultList = [];
    hex = hex <= 25 ? hex : hex % 25;
    // 解析出分割字符
    const splitStr = String.fromCharCode(hex + 97);
    // 分割出加密字符串的加密后的每个字符
    const strCharList = str.split(splitStr);
    for (let i = 0; i < strCharList.length; i++) {
      // 将加密后的每个字符转成加密后的ascll码
      let charCode = parseInt(strCharList[i], hex);
      // 异或解密出原字符的ascll码
      charCode = (charCode * 1) ^ xor;
      const strChar = String.fromCharCode(charCode);
      resultList.push(strChar);
    }
    return resultList.join('');
  }

  /**
   * simpleEncrypto 加密程序
   * @param {Strng} str 待加密字符串
   * @param {Number} xor 异或值
   * @param {Number} hex 加密后的进制数
   * @return {Strng} 加密后的字符串
   */
  static simpleEncrypto(str: string, xor: number, hex: number) {
    if (
      !lodash.isString(str) ||
      !lodash.isNumber(xor) ||
      !lodash.isNumber(hex)
    ) {
      return;
    }
    const resultList = [];
    hex = hex <= 25 ? hex : hex % 25;
    for (let i = 0; i < str.length; i++) {
      // 提取字符串每个字符的ascll码
      let charCode = str.charCodeAt(i);
      // 进行异或加密
      charCode = (charCode * 1) ^ xor;
      // 异或加密后的字符转成 hex 位数的字符串
      const code = charCode.toString(hex);
      resultList.push(code);
    }
    const splitStr = String.fromCharCode(hex + 97);
    return resultList.join(splitStr);
  }
}
