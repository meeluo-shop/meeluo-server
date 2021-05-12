import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateAdminGameCategoryFailedException extends ApiException {
  readonly code: number = 109101;
  readonly msg: string = '创建游戏分类失败，请刷新页面后重新再试';
}

export class UpdateAdminGameCategoryFailedException extends ApiException {
  readonly code: number = 109102;
  readonly msg: string = '修改游戏分类失败，请刷新页面后重新再试';
}

export class GetAdminGameCategorysFailedException extends ApiException {
  readonly code: number = 109103;
  readonly msg: string = '获取游戏分类列表失败，请刷新页面后重新再试';
}

export class GetAdminGameCategoryDetailFailedException extends ApiException {
  readonly code: number = 109104;
  readonly msg: string = '获取游戏分类详情失败，请刷新页面后重新再试';
}

export class DeleteAdminGameCategoryFailedException extends ApiException {
  readonly code: number = 109105;
  readonly msg: string = '删除游戏分类失败，请刷新页面后重新再试';
}

export class AdminGameCategoryHasGameException extends ApiException {
  readonly code: number = 109106;
  readonly msg: string = '请先清空该分类下的所有游戏';
}

export class AdminGameCategoryHasChildrenException extends ApiException {
  readonly code: number = 109107;
  readonly msg: string = '请先清空该分类下的所有子分类';
}
