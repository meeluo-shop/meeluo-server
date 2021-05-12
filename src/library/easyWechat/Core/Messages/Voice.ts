'use strict';

import { Media } from './Media';

export class Voice extends Media {
  protected type = 'voice';
  protected properties: Array<string> = ['media_id', 'recognition'];
}
