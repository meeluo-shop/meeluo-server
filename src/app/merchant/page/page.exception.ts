import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateMerchantPageFailedException extends ApiException {
  readonly code: number = 320001;
  readonly msg: string = '新增页面失败，请刷新页面后重新再试';
}

export class UpdateMerchantPageFailedException extends ApiException {
  readonly code: number = 320002;
  readonly msg: string = '修改页面失败，请刷新页面后重新再试';
}

export class GetMerchantPageesFailedException extends ApiException {
  readonly code: number = 320003;
  readonly msg: string = '获取页面列表失败，请刷新页面后重新再试';
}

export class GetMerchantPageDetailFailedException extends ApiException {
  readonly code: number = 320004;
  readonly msg: string = '获取页面详情失败，请刷新页面后重新再试';
}

export class DeleteMerchantPageFailedException extends ApiException {
  readonly code: number = 320005;
  readonly msg: string = '删除页面失败，请刷新页面后重新再试';
}

export class UpdateMerchantPageTypeFailedException extends ApiException {
  readonly code: number = 320006;
  readonly msg: string = '设置页面类型失败，请刷新页面后重新再试';
}

export class MerchantPageTypeExistsException extends ApiException {
  readonly code: number = 320007;
  readonly msg: string = '页面类型已存在，请刷新页面后重新再试';
}
