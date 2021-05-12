'use strict';

import { Message } from './Message';

export class Music extends Message {
  protected type = 'music';
  protected properties: Array<string> = [
    'title',
    'description',
    'url',
    'hq_url',
    'thumb_media_id',
    'format',
  ];
  protected jsonAliases: object = {
    musicurl: 'url',
    hqmusicurl: 'hq_url',
  };

  toXmlArray(): object {
    const music = {
      Music: {
        Title: this.get('title'),
        Description: this.get('description'),
        MusicUrl: this.get('url'),
        HQMusicUrl: this.get('hq_url'),
      },
    };
    const thumbMediaId = this.get('thumb_media_id');
    if (thumbMediaId) {
      music['Music']['ThumbMediaId'] = thumbMediaId;
    }

    return music;
  }
}
