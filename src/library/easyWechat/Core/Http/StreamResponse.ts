'use strict';

import Response from './Response';
import * as Fs from 'fs';
import { createHash } from '../Utils';

export default class StreamResponse extends Response {
  save(directory: string, filename = ''): string {
    const dirStatus = Fs.statSync(directory);
    if (!dirStatus.isDirectory()) {
      Fs.mkdirSync(directory);
    }
    try {
      Fs.accessSync(directory, Fs.constants.W_OK);
    } catch (e) {
      throw new Error(`'${directory}' is not writable.`);
    }

    const buffer = this.getContent();
    const content = buffer.toString();

    if (!content || '{' === content[0]) {
      throw new Error('Invalid media response content.');
    }

    if (!filename) {
      filename = createHash(content, 'md5');
    }

    Fs.writeFileSync(`${directory}/${filename}`, buffer);

    return filename;
  }

  saveAs(directory: string, filename = ''): string {
    return this.save(directory, filename);
  }

  static buildFromResponse(res: Response) {
    return new StreamResponse(
      res.getContent(),
      res.getStatusCode(),
      res.getHeaders(),
    );
  }
}
