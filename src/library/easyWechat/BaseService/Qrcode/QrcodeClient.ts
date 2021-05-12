'use strict';

import BaseClient from '../../Core/BaseClient';
import { snakeToHump } from '../../Core/Utils';

export interface QRCodeResp {
  ticket: string;
  url: string;
  expireSeconds?: number;
}

export default class QrcodeClient extends BaseClient {
  DAY = 86400;
  SCENE_MAX_VALUE = 100000;
  SCENE_QR_CARD = 'QR_CARD';
  SCENE_QR_TEMPORARY = 'QR_SCENE';
  SCENE_QR_TEMPORARY_STR = 'QR_STR_SCENE';
  SCENE_QR_FOREVER = 'QR_LIMIT_SCENE';
  SCENE_QR_FOREVER_STR = 'QR_LIMIT_STR_SCENE';

  protected baseUrl = 'https://api.weixin.qq.com/cgi-bin/';

  /**
   * 创建临时二维码
   * @param sceneValue 业务标识
   * @param expireSeconds 有效时间，单位：秒
   */
  temporary(sceneValue: string | number, expireSeconds = 0) {
    let type = '',
      sceneKey = '';
    if (typeof sceneValue == 'number' && sceneValue > 0) {
      type = this.SCENE_QR_TEMPORARY;
      sceneKey = 'scene_id';
    } else {
      type = this.SCENE_QR_TEMPORARY_STR;
      sceneKey = 'scene_str';
    }
    const scene: object = {};
    scene[sceneKey] = sceneValue;

    return this.create(type, scene, true, expireSeconds);
  }

  /**
   * 创建永久二维码
   * @param sceneValue 业务标识
   */
  forever(sceneValue: number | string) {
    let type = '',
      sceneKey = '';
    if (
      typeof sceneValue == 'number' &&
      sceneValue > 0 &&
      sceneValue < 100000
    ) {
      type = this.SCENE_QR_FOREVER;
      sceneKey = 'scene_id';
    } else {
      type = this.SCENE_QR_FOREVER_STR;
      sceneKey = 'scene_str';
    }
    const scene: object = {};
    scene[sceneKey] = sceneValue;
    return this.create(type, scene, false);
  }

  /**
   * 获取二维码地址
   * @param ticket 通过temporary或forever方法获得
   */
  url(ticket: string): string {
    return `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${ticket}`;
  }

  protected async create(
    actionName: string,
    actionInfo,
    temporary = true,
    expireSeconds = 0,
  ): Promise<QRCodeResp> {
    if (!expireSeconds || expireSeconds <= 0) {
      expireSeconds = 7 * this.DAY;
    }
    const params = {
      action_name: actionName,
      action_info: {
        scene: actionInfo,
      },
    };
    if (temporary) {
      params['expire_seconds'] = Math.min(expireSeconds, 30 * this.DAY);
    }
    const resp = await this.httpPostJson('qrcode/create', params);
    return snakeToHump(resp);
  }
}
