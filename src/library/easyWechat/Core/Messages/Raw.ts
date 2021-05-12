'use strict';

import { Message } from './Message';

export class Raw extends Message {
  protected type = 'raw';
  protected properties: Array<string> = ['content'];

  constructor(content: string) {
    super({ content });
  }

  toXmlArray(): object {
    return {
      Content: this.get('content'),
    };
  }

  transformForJsonRequest(appends: object = {}, withType = true): object {
    return JSON.parse(this.get('content')) || '';
  }

  toString() {
    return this.get('content') || '';
  }
}
