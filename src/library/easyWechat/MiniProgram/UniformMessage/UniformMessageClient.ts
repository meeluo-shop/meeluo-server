'use strict';

import BaseClient from '../../OfficialAccount/TemplateMessage/TemplateMessageClient';
import { Merge } from '../../Core/Merge';
import { inArray } from '../../Core/Utils';

export default class UniformMessageClient extends BaseClient {
  API_SEND = 'cgi-bin/message/wxopen/template/uniform_send';

  protected message = {
    touser: '',
  };

  protected weappMessage = {
    template_id: '',
    page: '',
    form_id: '',
    data: '',
    emphasis_keyword: '',
  };

  protected mpMessage = {
    appid: '',
    template_id: '',
    url: '',
    miniprogram: '',
    data: '',
  };

  protected required = [
    'touser',
    'template_id',
    'form_id',
    'miniprogram',
    'appid',
  ];

  protected formatMessage(data: object): object {
    const params = Merge(this.message, data);

    if (!params['touser']) {
      throw new Error('Attribute "touser" can not be empty!');
    }

    if (params['weapp_template_msg']) {
      params['weapp_template_msg'] = this.formatWeappMessage(
        params['weapp_template_msg'],
      );
    }

    if (params['mp_template_msg']) {
      params['mp_template_msg'] = this.formatMpMessage(
        params['mp_template_msg'],
      );
    }

    return params;
  }

  protected formatWeappMessage(data: object): object {
    const params = this.baseFormat(data, this.weappMessage);

    params['data'] = this.formatData(params['data'] || {});

    return params;
  }

  protected formatMpMessage(data: object): object {
    const params = this.baseFormat(data, this.weappMessage);

    if (!params['miniprogram']['appid']) {
      params['miniprogram']['appid'] = this.app['config']['appid'];
    }

    params['data'] = this.formatData(params['data'] || {});

    return params;
  }

  protected baseFormat(data: object = {}, defaultData: object = {}): object {
    const params = Merge(defaultData, data);

    for (const key in params) {
      if (inArray(key, this.required) && !params[key] && !defaultData[key]) {
        throw new Error(`Attribute "${key}" can not be empty!`);
      }

      params[key] = params[key] || defaultData[key];
    }

    return params;
  }
}
