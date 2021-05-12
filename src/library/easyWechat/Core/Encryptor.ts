'use strict';

import * as Crypto from 'crypto';
import { getTimestamp } from './Utils';

export default class Encryptor {
  protected appId: string = null;
  protected token: string = null;
  protected aesKey: Buffer = null;
  protected blockSize = 32;

  constructor(appId: string, token: string, aesKey: string) {
    this.appId = appId;
    this.token = token;
    this.aesKey = Buffer.from(aesKey + '=', 'base64');
  }

  getToken(): string {
    return this.token;
  }

  signature(...args): string {
    args.sort();
    const shasum = Crypto.createHash('sha1');
    shasum.update(args.join(''));
    return shasum.digest('hex');
  }

  encrypt(text, nonce = null, timestamp = null): object {
    let encrypted = '';
    try {
      // 算法：AES_Encrypt(随机16B + msg_len(4) + msg + appID)
      const randomString = Crypto.pseudoRandomBytes(16);

      const msg = Buffer.from(text);
      const msgLength = Buffer.alloc(4);
      msgLength.writeUInt32BE(msg.length, 0);

      const encoded = this.pkcs7Pad(
        Buffer.concat([randomString, msgLength, msg, Buffer.from(this.appId)]),
        this.blockSize,
      );

      const cipher = Crypto.createCipheriv(
        'aes-256-cbc',
        this.aesKey,
        this.aesKey.slice(0, 16),
      );
      cipher.setAutoPadding(false);

      encrypted = Buffer.concat([
        cipher.update(encoded),
        cipher.final(),
      ]).toString('base64');
    } catch (e) {
      throw new Error('Fail to encrypt data');
    }

    if (!nonce) nonce = this.appId.slice(0, 10);
    if (!timestamp) timestamp = getTimestamp();

    return {
      Encrypt: encrypted,
      MsgSignature: this.signature(this.token, timestamp, nonce, encrypted),
      TimeStamp: timestamp,
      Nonce: nonce,
    };
  }

  decrypt(text, msgSignature, nonce, timestamp): string {
    const signature = this.signature(this.token, nonce, timestamp, text);
    if (signature !== msgSignature) {
      throw new Error('Invalid Signature.');
    }

    const decipher = Crypto.createDecipheriv(
      'aes-256-cbc',
      this.aesKey,
      this.aesKey.slice(0, 16),
    );
    decipher.setAutoPadding(false);
    let deciphered = Buffer.concat([
      decipher.update(text, 'base64'),
      decipher.final(),
    ]);

    deciphered = this.pkcs7Unpad(deciphered);
    const content = deciphered.slice(16);
    const length = content.slice(0, 4).readUInt32BE(0);

    if (content.slice(length + 4).toString() !== this.appId) {
      throw new Error('Invalid appId.');
    }

    return content.slice(4, length + 4).toString();
  }

  /**
   * 删除解密后明文的补位字符
   * @param {Buffer} text 解密后的明文
   * @return {Buffer}
   */
  pkcs7Unpad(text: Buffer): Buffer {
    let pad = text[text.length - 1];

    if (pad < 1 || pad > this.blockSize) {
      pad = 0;
    }

    return text.slice(0, text.length - pad);
  }

  /**
   * 对需要加密的明文进行填充补位
   * @param {Buffer} text 需要进行填充补位操作的明文
   * @return {Buffer}
   */
  pkcs7Pad(text: Buffer, blockSize: number): Buffer {
    if (blockSize > 256) {
      throw new Error('blockSize may not be more than 256');
    }
    //计算需要填充的位数
    const amountToPad = blockSize - (text.length % blockSize);

    const result = Buffer.alloc(amountToPad);
    result.fill(amountToPad);

    return Buffer.concat([text, result]);
  }
}
