import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientRechargePlanListException extends ApiException {
  readonly code: number = 412001;
  readonly msg: string = '获取充值套餐列表失败';
}

export class ClientRechargeGetSettingException extends ApiException {
  readonly code: number = 412002;
  readonly msg: string = '获取充值设置失败';
}

export class ClientRechargeNoPlanIdException extends ApiException {
  readonly code: number = 412003;
  readonly msg: string = '无效的充值套餐';
}

export class ClientRechargeInvalidAmountException extends ApiException {
  readonly code: number = 412004;
  readonly msg: string = '无效的充值金额';
}

export class ClientRechargeGetBalanceLogException extends ApiException {
  readonly code: number = 412005;
  readonly msg: string = '获取账户余额记录失败';
}

export class ClientRechargeUnifyWechatPayException extends ApiException {
  readonly code: number = 412006;
  readonly msg: string = '发起微信支付失败';
}

export class ClientRechargeWechatPaySuccessException extends ApiException {
  readonly code: number = 412007;
  readonly msg: string = '查询微信充值订单状态失败';
}

export class ClientRechargeWechatPayFailedException extends ApiException {
  readonly code: number = 412008;
  readonly msg: string = '微信支付失败，请联系客服人员';
}
