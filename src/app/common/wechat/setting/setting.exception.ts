import { ApiException } from '@jiaxinjiang/nest-exception';

export class WechatGetOfficialAccountSettingFailedException extends ApiException {
  readonly code: number = 905101;
  readonly msg: string = '获取微信公众号设置失败，请刷新页面后重新再试';
}

export class WechatSetOfficialAccountSettingFailedException extends ApiException {
  readonly code: number = 905102;
  readonly msg: string = '更新微信公众号设置失败，请刷新页面后重新再试';
}

export class WechatSetPaymentSettingFailedException extends ApiException {
  readonly code: number = 905103;
  readonly msg: string = '更新微信支付商户设置失败，请刷新页面后重新再试';
}

export class WechatGetPaymentSettingFailedException extends ApiException {
  readonly code: number = 905104;
  readonly msg: string = '获取微信支付商户设置失败，请刷新页面后重新再试';
}

export class WechatPaymentUploadCertException extends ApiException {
  readonly code: number = 905105;
  readonly msg: string = '上传微信支付证书失败';
}

export class WechatPaymentGetCertNameException extends ApiException {
  readonly code: number = 905106;
  readonly msg: string = '获取微信支付证书名称失败';
}
