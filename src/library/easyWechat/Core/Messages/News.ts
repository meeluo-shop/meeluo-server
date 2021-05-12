'use strict';

import { Message } from './Message';
import { NewsItem } from './NewsItem';

export class News extends Message {
  protected type = 'news';
  protected properties: Array<string> = ['items'];

  constructor(items: Array<NewsItem> = []) {
    super({ items });
  }

  propertiesToArray(data, aliases = []): object {
    const newItems: Array<any> = [];
    try {
      this.get('items').forEach(item => {
        if (item instanceof NewsItem) {
          newItems.push(item.toXmlArray());
        }
      });
    } catch (e) {}

    return {
      articles: newItems,
    };
  }

  toXmlArray(): object {
    const newItems: Array<any> = [];
    try {
      this.get('items').forEach(item => {
        if (item instanceof NewsItem) {
          newItems.push(item.toXmlArray());
        }
      });
    } catch (e) {}

    return {
      ArticleCount: newItems.length,
      Articles: {
        item: newItems,
      },
    };
  }
}
