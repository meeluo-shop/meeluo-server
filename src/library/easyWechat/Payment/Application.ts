'use strict';

import BaseApplication from '../Core/BaseApplication';
import {
  getTimestamp,
  randomString,
  makeSignature,
  buildQueryString,
} from '../Core/Utils';
import Response from '../Core/Http/Response';
import PaidNotify from './Notify/Paid';
import RefundedNotify from './Notify/Refunded';
import ScannedNotify from './Notify/Scanned';
import AccessToken from '../OfficialAccount/Auth/AccessToken';
import UrlClient from '../BaseService/Url/UrlClient';
import PaymentBase from './Base/PaymentBase';
import BillClient from './Bill/BillClient';
import PayClient from './Pay/PayClient';
import CouponClient from './Coupon/CouponClient';
import JssdkClient from './Jssdk/JssdkClient';
import MerchantClient from './Merchant/MerchantClient';
import OrderClient from './Order/OrderClient';
import RedpackClient from './Redpack/RedpackClient';
import RefundClient from './Refund/RefundClient';
import ReverseClient from './Reverse/ReverseClient';
import SandboxClient from './Sandbox/SandboxClient';
import TransferClient from './Transfer/TransferClient';
import SecurityClient from './Security/SecurityClient';
import ProfitSharingClient from './ProfitSharing/ProfitSharingClient';

export default class Payment extends BaseApplication {
  protected defaultConfig: object = {
    // 必要配置
    appid: '',
    mchId: '',
    key: '', // API 密钥
    notifyUrl: '',
    cert: null,
    http: {
      baseUrl: 'https://api.mch.weixin.qq.com/',
    },
  };

  public base: PaymentBase = null;
  public bill: BillClient = null;
  public coupon: CouponClient = null;
  public jssdk: JssdkClient = null;
  public merchant: MerchantClient = null;
  public pay: PayClient = null;
  public order: OrderClient = null;
  public redpack: RedpackClient = null;
  public refund: RefundClient = null;
  public reverse: ReverseClient = null;
  public sandbox: SandboxClient = null;
  public transfer: TransferClient = null;
  public security: SecurityClient = null;
  public profit_sharing: ProfitSharingClient = null;
  public access_token: AccessToken = null;
  public url: UrlClient = null;

  constructor(
    config: Record<string, any> = {},
    prepends: Record<string, any> = {},
    id: string = null,
  ) {
    super(config, prepends, id);

    this.registerProviders();
  }

  registerProviders(): void {
    super.registerCommonProviders();

    this.offsetSet('base', function(app) {
      return new PaymentBase(app);
    });
    this.offsetSet('bill', function(app) {
      return new BillClient(app);
    });
    this.offsetSet('coupon', function(app) {
      return new CouponClient(app);
    });
    this.offsetSet('jssdk', function(app) {
      return new JssdkClient(app);
    });
    this.offsetSet('merchant', function(app) {
      return new MerchantClient(app);
    });
    this.offsetSet('pay', function(app) {
      return new PayClient(app);
    });
    this.offsetSet('order', function(app) {
      return new OrderClient(app);
    });
    this.offsetSet('redpack', function(app) {
      return new RedpackClient(app);
    });
    this.offsetSet('refund', function(app) {
      return new RefundClient(app);
    });
    this.offsetSet('reverse', function(app) {
      return new ReverseClient(app);
    });
    this.offsetSet('sandbox', function(app) {
      return new SandboxClient(app);
    });
    this.offsetSet('transfer', function(app) {
      return new TransferClient(app);
    });
    this.offsetSet('security', function(app) {
      return new SecurityClient(app);
    });
    this.offsetSet('profit_sharing', function(app) {
      return new ProfitSharingClient(app);
    });

    // OfficialAccount
    if (!this.access_token) {
      this.offsetSet('access_token', function(app) {
        return new AccessToken(app);
      });
    }

    // BaseService
    this.offsetSet('url', function(app) {
      return new UrlClient(app);
    });
  }

  scheme(product_id: string): string {
    const params = {
      appid: this.config['appid'],
      mch_id: this.config['mchId'],
      time_stamp: getTimestamp(),
      nonce_str: randomString(16),
      product_id,
    };

    params['sign'] = makeSignature(params, this.config['key']);

    return 'weixin://wxpay/bizpayurl?' + buildQueryString(params);
  }

  codeUrlScheme(codeUrl: string): string {
    return 'weixin://wxpay/bizpayurl?sr=' + codeUrl;
  }

  inSandbox(): boolean {
    return !!this.config['sandbox'];
  }

  getKey(endpoint: string = null) {
    if ('sandboxnew/pay/getsignkey' === endpoint) {
      return this.config['key'];
    }

    const key = this.inSandbox()
      ? this['sandbox'].getKey()
      : this['config']['key'];

    if (!key) {
      throw new Error('config key should not empty.');
    }

    if (32 !== key.length) {
      throw new Error(`'${key}' should be 32 chars length.`);
    }

    return key;
  }

  /**
   * 处理付款结果通知
   * @param closure 处理函数。需接收2个参数，第1个参数通知消息message，第2个参数为设置错误消息的方法。处理函数需要return true;表示处理成功
   */
  handlePaidNotify(closure: Function): Promise<Response> {
    return new PaidNotify(this).handle(closure);
  }
  /**
   * 处理退款结果通知
   * @param closure 处理函数。需接收3个参数，第1个参数通知消息message，第2个参数为message['req_info']解密后的信息，第3个参数为设置错误消息的方法。处理函数需要return true;表示处理成功
   */
  handleRefundedNotify(closure: Function): Promise<Response> {
    return new RefundedNotify(this).handle(closure);
  }
  /**
   * 扫码支付通知
   * @param closure 处理函数。需接收3个参数，第1个参数通知消息message，第2个参数返回“通信错误”给微信，第3个参数返回“业务错误”给微信。处理函数需要return prepay_id
   */
  handleScannedNotify(closure: Function): Promise<Response> {
    return new ScannedNotify(this).handle(closure);
  }
}
