'use strict';

import { Message } from './Message';

export class TaskCard extends Message {
  protected type = 'taskcard';
  protected properties: Array<string> = [
    'title',
    'description',
    'url',
    'task_id',
    'btn',
  ];
}
