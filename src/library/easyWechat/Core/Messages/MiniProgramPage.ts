'use strict';

import { Message } from './Message';

export class MiniProgramPage extends Message {
  protected type = 'miniprogrampage';
  protected properties: Array<string> = [
    'title',
    'appid',
    'pagepath',
    'thumb_media_id',
  ];
  protected required: Array<string> = ['thumb_media_id', 'appid', 'pagepath'];
}
