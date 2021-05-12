import { ApiException } from '@jiaxinjiang/nest-exception';

export class AgentCreateMerchantFailedException extends ApiException {
  readonly code: number = 201001;
  readonly msg: string = '新增商户失败，请刷新页面后重试';
}

export class AgentMerchantPhoneRepeatException extends ApiException {
  readonly code: number = 201002;
  readonly msg: string = '手机号码已被使用';
}

export class AgentMerchantEmailRepeatException extends ApiException {
  readonly code: number = 201003;
  readonly msg: string = '电子邮箱已被使用';
}

export class AgentUpdateMerchantFailedException extends ApiException {
  readonly code: number = 201004;
  readonly msg: string = '修改商户失败，请刷新页面后重试';
}

export class AgentMerchantStaffNoExistException extends ApiException {
  readonly code: number = 201005;
  readonly msg: string = '商户管理员不存在，请联系客服人员反馈';
}

export class AgentGetMerchantDetailException extends ApiException {
  readonly code: number = 201006;
  readonly msg: string = '获取商户详情失败，请刷新页面后重试';
}

export class AgentGetMerchantsFailedException extends ApiException {
  readonly code: number = 201008;
  readonly msg: string = '获取商户列表失败，请刷新页面后重试';
}

export class AgentActiveMerchantException extends ApiException {
  readonly code: number = 201008;
  readonly msg: string = '更新商户状态失败，请刷新页面后重试';
}

export class AgentMerchantCountOverLimitException extends ApiException {
  readonly code: number = 201009;
  readonly msg: string = '可创建的商户数量已超过上限，请联系服务商增加';
}
