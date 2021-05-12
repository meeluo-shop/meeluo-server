'use strict';

import BaseClient from '../Core/BaseClient';
import {
  randomString,
  makeSignature,
  humpToSnake,
  snakeToHump,
} from '../../Core/Utils';

export interface SceneInfo {
  id: string; // 门店编号，由商户自定义
  name?: string; // 门店名称 ，由商户自定义
  areaCode?: string; // 门店所在地行政区划码，详细见《最新县及县以上行政区划代码》
  address?: string; // 门店详细地址 ，由商户自定义
}

export interface UnifiedorderParams {
  appid?: string; // 服务商的APPID
  mchId?: string; // 微信支付分配的商户号
  subAppid?: string; // 当前调起支付的小程序APPID
  subMchId?: string; // 微信支付分配的子商户号
  deviceInfo?: string; // 终端设备号(门店号或收银设备ID)，注意：PC网页或公众号内支付请传"WEB"
  nonceStr?: string; // 随机字符串，不长于32位。推荐随机数生成算法
  sign?: string; // 签名，详见签名生成算法
  signType?: 'HMAC-SHA256' | 'MD5'; // 签名类型，目前支持和MD5，默认为MD5
  body: string; // 腾讯充值中心-QQ会员充值
  detail?: string; // 商品详细描述，对于使用单品优惠的商户，该字段必须按照规范上传，详见“单品优惠参数说明”
  attach?: string; // 附加数据，在查询API和支付通知中原样返回，该字段主要用于商户携带订单的自定义数据
  outTradeNo: string; //	商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*且在同一个商户号下唯一
  feeType?: string; // 符合ISO 4217标准的三位字母代码，默认人民币：CNY，其他值列表详见货币类型
  totalFee: number; // 订单总金额，只能为整数，详见支付金额
  spbillCreateIp: string; // 支持IPV4和IPV6两种格式的IP地址。调用微信支付API的机器IP
  timeStart?: string; // 订单生成时间，格式为yyyyMMddHHmmss
  timeExpire?: string; // 订单失效时间，格式为yyyyMMddHHmmss。订单失效时间是针对订单号而言的，由于在请求支付的时候有一个必传参数prepay_id只有两小时的有效期，所以在重入时间超过2小时的时候需要重新请求下单接口获取新的prepay_id，建议：最短失效时间间隔大于1分钟
  goodsTag?: string; // 订单优惠标记，代金券或立减优惠功能的参数，说明详见代金券或立减优惠
  notifyUrl?: string; // 接收微信支付异步通知回调地址，通知url必须为直接可访问的url，不能携带参数。
  tradeType: string; // 小程序取值如下：JSAPI，详细说明见参数规定
  limitPay?: string; // no_credit--指定不能使用信用卡支付
  openid?: string; // trade_type=JSAPI，此参数必传，用户在商户appid下的唯一标识。
  subOpenid?: string; // trade_type=JSAPI，此参数必传，用户在子商户appid下的唯一标识。openid和sub_openid可以选传其中之一，如果选择传sub_openid,则必须传sub_appid。下单前需要调用【网页授权获取用户信息】接口获取到用户的Openid。
  receipt?: string; // Y，传入Y时，支付成功消息和支付详情页将出现开票入口。需要在微信支付商户平台或微信公众平台开通电子发票功能，传此字段才可生效
  sceneInfo?: SceneInfo;
}

export interface UnifiedorderResp {
  returnCode: 'SUCCESS' | 'FAIL';
  returnMsg: string;
  appid?: string;
  mchId?: string;
  subMchId?: string;
  nonceStr?: string;
  sign?: string;
  resultCode?: string;
  prepayId?: string;
  tradeType?: string;
  subAppid?: string;
}

export default class PayClient extends BaseClient {
  /**
   * 统一下单
   * @param params 订单信息
   * @param isContract 是否支付中签约，默认 false
   */
  async unifiedorder(params: UnifiedorderParams): Promise<UnifiedorderResp> {
    params.appid = params.appid || this.app['config']['appid'];
    params.mchId = params.mchId || this.app['config']['mchId'];
    params.notifyUrl = params.notifyUrl || this.app['config']['notifyUrl'];
    params.nonceStr = params.nonceStr || randomString(32);
    params.signType = params.signType || 'MD5';
    const newParams = humpToSnake(params);
    newParams.sign = makeSignature(
      newParams,
      this.app['config']['key'],
      params.signType,
    );
    const resp = await this.request(this.wrap('pay/unifiedorder'), newParams);
    if (!resp?.prepay_id) {
      throw new Error(resp?.['err_code_des'] || '微信支付发起失败，请重新尝试');
    }
    return snakeToHump(resp);
  }

  /**
   * 生成小程序调起支付签名
   * @param param
   */
  makePaySign(param: {
    appId: string;
    nonceStr: string;
    package: string;
    signType: string;
    timeStamp: string;
  }) {
    return makeSignature(param, this.app['config']['key'], param.signType);
  }
}
