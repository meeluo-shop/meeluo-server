import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantGetPermsFailedException extends ApiException {
  readonly code: number = 314001;
  readonly msg: string = '获取权限列表失败，请刷新页面后重试';
}

export class MerchantGetPermDetailFailedException extends ApiException {
  readonly code: number = 314002;
  readonly msg: string = '获取权限详情失败，请刷新页面后重试';
}
