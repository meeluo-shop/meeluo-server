import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateMerchantFailedException extends ApiException {
  readonly code: number = 108001;
  readonly msg: string = '新增商户失败，请刷新页面后重试';
}

export class PhoneRepeatFailedException extends ApiException {
  readonly code: number = 108002;
  readonly msg: string = '手机号码已被使用';
}

export class EmailRepeatFailedException extends ApiException {
  readonly code: number = 108003;
  readonly msg: string = '电子邮箱已被使用';
}

export class UpdateMerchantFailedException extends ApiException {
  readonly code: number = 108004;
  readonly msg: string = '修改商户失败，请刷新页面后重试';
}

export class MerchantStaffNoExistException extends ApiException {
  readonly code: number = 108005;
  readonly msg: string = '商户管理员不存在，请联系客服人员反馈';
}

export class GetMerchantDetailException extends ApiException {
  readonly code: number = 108006;
  readonly msg: string = '获取商户详情失败，请刷新页面后重试';
}

export class GetMerchantsFailedException extends ApiException {
  readonly code: number = 108007;
  readonly msg: string = '获取商户列表失败，请刷新页面后重试';
}

export class ActiveMerchantDetailException extends ApiException {
  readonly code: number = 108008;
  readonly msg: string = '更新商户状态失败，请刷新页面后重试';
}
