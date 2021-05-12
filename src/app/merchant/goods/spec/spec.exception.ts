import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateMerchantGoodsSpecFailedException extends ApiException {
  readonly code: number = 306001;
  readonly msg: string = '新增商品规格失败，请刷新页面后重新再试';
}
