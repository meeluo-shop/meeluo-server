import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantCreateStaffFailedException extends ApiException {
  readonly code: number = 317001;
  readonly msg: string = '新增员工失败，请刷新页面后重试';
}

export class MerchantStaffPhoneRepeatException extends ApiException {
  readonly code: number = 317002;
  readonly msg: string = '手机号已存在';
}

export class MerchantUpdateStaffFailedException extends ApiException {
  readonly code: number = 317003;
  readonly msg: string = '修改员工失败，请刷新页面后重试';
}

export class MerchantStaffNoExistentException extends ApiException {
  readonly code: number = 317004;
  readonly msg: string = '员工不存在';
}

export class MerchantGetStaffsFailedException extends ApiException {
  readonly code: number = 317005;
  readonly msg: string = '获取员工列表失败，请刷新页面后重试';
}

export class MerchantGetStaffDetailFailedException extends ApiException {
  readonly code: number = 317006;
  readonly msg: string = '获取员工详情失败，请刷新页面后重试';
}

export class MerchantDeleteStaffFailedException extends ApiException {
  readonly code: number = 317007;
  readonly msg: string = '删除员工失败，请刷新页面后重试';
}

export class MerchantActiveStaffDetailException extends ApiException {
  readonly code: number = 317008;
  readonly msg: string = '更新员工状态失败，请刷新页面后重试';
}

export class MerchantStaffEmailRepeatException extends ApiException {
  readonly code: number = 317009;
  readonly msg: string = '邮箱已存在';
}

export class MerchantStaffBindWechatUserException extends ApiException {
  readonly code: number = 317010;
  readonly msg: string = '绑定微信用户失败';
}
