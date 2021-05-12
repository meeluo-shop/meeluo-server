'use strict';

import { Message } from './Message';

export class TextCard extends Message {
  protected type = 'textcard';
  protected properties: Array<string> = ['title', 'description', 'url'];
}
