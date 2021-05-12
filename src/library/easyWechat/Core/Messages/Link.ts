'use strict';

import { Message } from './Message';

export class Link extends Message {
  protected type = 'link';
  protected properties: Array<string> = ['title', 'description', 'url'];
}
