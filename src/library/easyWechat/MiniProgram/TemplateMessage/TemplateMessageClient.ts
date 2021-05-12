'use strict';

import BaseClient from '../../OfficialAccount/TemplateMessage/TemplateMessageClient';

export default class TemplateMessageClient extends BaseClient {
  API_SEND = 'cgi-bin/message/wxopen/template/send';

  protected message = {
    touser: '',
    template_id: '',
    page: '',
    form_id: '',
    data: '',
    emphasis_keyword: '',
  };

  protected required = ['touser', 'template_id', 'form_id'];

  list(offset: number, count: number): Promise<any> {
    return this.httpPostJson('cgi-bin/wxopen/template/library/list', {
      offset,
      count,
    });
  }

  get(id: string): Promise<any> {
    return this.httpPostJson('cgi-bin/wxopen/template/library/get', {
      id,
    });
  }

  add(id: string, keyword: Array<number>): Promise<any> {
    return this.httpPostJson('cgi-bin/wxopen/template/library/add', {
      id,
      keyword,
    });
  }

  delete(template_id: string): Promise<any> {
    return this.httpPostJson('cgi-bin/wxopen/template/del', {
      template_id,
    });
  }

  getTemplates(offset: number, count: number): Promise<any> {
    return this.httpPostJson('cgi-bin/wxopen/template/list', {
      offset,
      count,
    });
  }
}
