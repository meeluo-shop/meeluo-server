'use strict';

import BaseClient from '../../Core/BaseClient';

export default class DeviceClient extends BaseClient {
  /**
   * 申请设备 ID
   * @param data 子参数： quantity，申请数量；apply_reason，申请理由；comment，备注，可选；poi_id，门店ID，可选；
   */
  apply(data: object): Promise<any> {
    return this.httpPostJson('shakearound/device/applyid', data);
  }

  /**
   * 查询申请的审核状态
   * @param applyId 申请id
   */
  status(applyId: string): Promise<any> {
    return this.httpPostJson('shakearound/device/applystatus', {
      apply_id: applyId,
    });
  }

  /**
   * 编辑设备信息
   * @param deviceIdentifier 设备标识
   * @param comment 设备备注
   */
  update(deviceIdentifier: object, comment: string): Promise<any> {
    return this.httpPostJson('shakearound/device/update', {
      device_identifier: deviceIdentifier,
      comment,
    });
  }

  /**
   * 设备与门店关联
   * @param deviceIdentifier 设备标识
   * @param poiId 门店id
   */
  bindPoi(deviceIdentifier: object, poiId: number): Promise<any> {
    return this.httpPostJson('shakearound/device/bindlocation', {
      device_identifier: deviceIdentifier,
      poi_id: poiId,
    });
  }

  /**
   * 设备与第三方门店关联
   * @param deviceIdentifier 设备标识
   * @param poiId 门店id
   * @param appId 关联门店所归属的公众账号的 appid
   */
  bindThirdPoi(
    deviceIdentifier: object,
    poiId: number,
    appId: string,
  ): Promise<any> {
    return this.httpPostJson('shakearound/device/bindlocation', {
      device_identifier: deviceIdentifier,
      poi_id: poiId,
      type: 2,
      poi_appid: appId,
    });
  }

  protected search(params: object): Promise<any> {
    return this.httpPostJson('shakearound/device/search', params);
  }

  /**
   * 根据设备id批量取回设备数据
   * @param deviceIdentifiers 设备ID列表
   */
  listByIds(deviceIdentifiers: Array<object>): Promise<any> {
    return this.search({
      type: 1,
      device_identifiers: deviceIdentifiers,
    });
  }

  /**
   * 分页批量取回设备数据
   * @param lastId 前一次查询列表末尾的设备编号 device_id
   * @param count 设备数量，不能超过50个
   */
  list(lastId: number, count: number): Promise<any> {
    return this.search({
      type: 2,
      last_seen: lastId,
      count,
    });
  }

  /**
   * 根据申请时的批次 ID 分页批量取回设备数据
   * @param applyId 批次ID
   * @param lastId 前一次查询列表末尾的设备编号 device_id
   * @param count 设备数量，不能超过50个
   */
  listByApplyId(applyId: number, lastId: number, count: number): Promise<any> {
    return this.search({
      type: 3,
      apply_id: applyId,
      last_seen: lastId,
      count,
    });
  }
}
