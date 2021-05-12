'use strict';

import BaseClient from '../../Core/BaseClient';
import { Merge } from '../../Core/Merge';

export default class RealtimeLogClient extends BaseClient {
  /**
   * 实时日志查询
   * @param date 日期，仅支持最近7天
   * @param beginTime 开始时间，必须是date指定日期的时间
   * @param endTime 结束时间，必须是date指定日期的时间
   * @param options 其它参数
   */
  search(
    date: string,
    beginTime: number,
    endTime: number,
    options: object = {},
  ): Promise<any> {
    const params = Merge(
      {
        date: date,
        begintime: beginTime,
        endtime: endTime,
      },
      options,
    );

    return this.httpGet('wxaapi/userlog/userlog_search', params);
  }
}
