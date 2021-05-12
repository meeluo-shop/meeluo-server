'use strict';

import { Merge } from '../Merge';
import * as Request from 'request';
import BaseApplicatioin from '../BaseApplication';

export default class HttpMixin {
  doRequest(payload: object, returnResponse = false): Promise<any> {
    payload = payload || {};
    if (typeof payload['baseUrl'] == 'undefined' && this['baseUrl']) {
      payload['baseUrl'] = this['baseUrl'];
    }
    if (this['app'] && this['app'] instanceof BaseApplicatioin) {
      payload = Merge({}, this['app']['config']['http'] || {}, payload);
    }
    this['app']['log']('request', payload);
    return new Promise((resolve, reject) => {
      Request(payload, function(error, response, body) {
        if (error) {
          reject(error);
        } else {
          if (returnResponse) {
            resolve(response);
          } else {
            try {
              body = JSON.parse(body);
            } catch (e) {}
            if (!payload?.['qs']?.['access_token'] && body.errcode) {
              const err: any = new Error(body.errmsg || '微信接口调用异常');
              err.name = 'WeChatAPIError';
              err.code = body.errcode;
              reject(err);
            } else {
              resolve(body);
            }
          }
        }
      });
    });
  }
}
