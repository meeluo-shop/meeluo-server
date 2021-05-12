'use strict';

import Handler from './Handler';
import { isString, randomString } from '../../Core/Utils';
import Response from '../../Core/Http/Response';

export default class ScannedHandler extends Handler {
  protected check = false;
  protected alert = '';

  setAlert(message: string): void {
    this.alert = message;
  }

  async handle(closure: Function): Promise<Response> {
    if (typeof closure != 'function') {
      throw new Error('Should pass an closure function');
    }
    const result = await closure.apply(this, [
      await this.getMessage(),
      this.setFail,
      this.setAlert,
    ]);

    const attributes = {
      result_code: !this.alert && !this.fail ? this.SUCCESS : this.FAIL,
      err_code_des: this.alert,
    };

    if (!this.alert && isString(result)) {
      attributes['appid'] = this.app['config']['appid'];
      attributes['mch_id'] = this.app['config']['mchId'];
      attributes['nonce_str'] = randomString(16);
      attributes['prepay_id'] = result;
    }

    return this.respondWith(attributes, true).toResponse();
  }
}
