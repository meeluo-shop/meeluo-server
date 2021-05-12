import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantTableCreateException extends ApiException {
  readonly code: number = 325001;
  readonly msg: string = '创建餐桌失败，请刷新页面后重新再试';
}

export class MerchantTableUpdateException extends ApiException {
  readonly code: number = 325002;
  readonly msg: string = '修改餐桌失败，请刷新页面后重新再试';
}

export class MerchantTableListException extends ApiException {
  readonly code: number = 325003;
  readonly msg: string = '获取餐桌列表失败，请刷新页面后重新再试';
}

export class MerchantTableDetailException extends ApiException {
  readonly code: number = 325004;
  readonly msg: string = '获取餐桌详情失败，请刷新页面后重新再试';
}

export class MerchantTableDeleteException extends ApiException {
  readonly code: number = 325005;
  readonly msg: string = '删除餐桌失败，请刷新页面后重新再试';
}
