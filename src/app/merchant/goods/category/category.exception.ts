import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateMerchantGoodsCategoryFailedException extends ApiException {
  readonly code: number = 305001;
  readonly msg: string = '创建商品分类失败，请刷新页面后重新再试';
}

export class UpdateMerchantGoodsCategoryFailedException extends ApiException {
  readonly code: number = 305002;
  readonly msg: string = '修改商品分类失败，请刷新页面后重新再试';
}

export class GetMerchantGoodsCategorysFailedException extends ApiException {
  readonly code: number = 305003;
  readonly msg: string = '获取商品分类列表失败，请刷新页面后重新再试';
}

export class GetMerchantGoodsCategoryDetailFailedException extends ApiException {
  readonly code: number = 305004;
  readonly msg: string = '获取商品分类详情失败，请刷新页面后重新再试';
}

export class DeleteMerchantGoodsCategoryFailedException extends ApiException {
  readonly code: number = 305005;
  readonly msg: string = '删除商品分类失败，请刷新页面后重新再试';
}

export class MerchantGoodsCategoryHasGoodsException extends ApiException {
  readonly code: number = 305006;
  readonly msg: string = '请先清空该分类下的所有商品';
}

export class MerchantGoodsCategoryHasChildrenException extends ApiException {
  readonly code: number = 305007;
  readonly msg: string = '请先清空该分类下的所有子分类';
}
