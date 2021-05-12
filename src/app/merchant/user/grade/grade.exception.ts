import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateMerchantUserGradeFailedException extends ApiException {
  readonly code: number = 308001;
  readonly msg: string = '新增用户会员等级失败，请刷新页面后重新再试';
}

export class UpdateMerchantUserGradeFailedException extends ApiException {
  readonly code: number = 308002;
  readonly msg: string = '修改用户会员等级失败，请刷新页面后重新再试';
}

export class GetMerchantUserGradeDetailFailedException extends ApiException {
  readonly code: number = 308003;
  readonly msg: string = '获取用户会员等级详情失败，请刷新页面后重新再试';
}

export class DeleteMerchantUserGradeFailedException extends ApiException {
  readonly code: number = 308004;
  readonly msg: string = '删除用户会员等级失败，请刷新页面后重新再试';
}

export class GetMerchantUserGradeListFailedException extends ApiException {
  readonly code: number = 308005;
  readonly msg: string = '获取用户会员等级列表失败，请刷新页面后重新再试';
}

export class MerchantUserGradeWeightExistsException extends ApiException {
  readonly code: number = 308006;
  readonly msg: string = '当前会员级别已存在';
}
