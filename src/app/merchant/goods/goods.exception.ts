import { ApiException } from '@jiaxinjiang/nest-exception';

export class GetMerchantGoodsListFailedException extends ApiException {
  readonly code: number = 307001;
  readonly msg: string = '获取商品列表失败，请刷新页面后重新再试';
}

export class CreateMerchantGoodsFailedException extends ApiException {
  readonly code: number = 307002;
  readonly msg: string = '新增商品失败，请刷新页面后重新再试';
}

export class UpdateMerchantGoodsFailedException extends ApiException {
  readonly code: number = 307003;
  readonly msg: string = '修改商品失败，请刷新页面后重新再试';
}

export class GetMerchantGoodsDetailFailedException extends ApiException {
  readonly code: number = 307004;
  readonly msg: string = '获取商品详情失败，请刷新页面后重新再试';
}

export class DeleteMerchantGoodsFailedException extends ApiException {
  readonly code: number = 307005;
  readonly msg: string = '删除商品失败，请刷新页面后重新再试';
}

export class ActiveMerchantGoodsFailedException extends ApiException {
  readonly code: number = 307006;
  readonly msg: string = '商品上架失败，请刷新页面后重新再试';
}
