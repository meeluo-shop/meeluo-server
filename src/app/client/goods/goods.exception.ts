import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientGetGoodsListException extends ApiException {
  readonly code: number = 405001;
  readonly msg: string = '获取商品列表失败';
}

export class ClientGetPrizeListException extends ApiException {
  readonly code: number = 405002;
  readonly msg: string = '获取游戏商品奖品列表失败';
}

export class ClientGetGoodsDetailException extends ApiException {
  readonly code: number = 405003;
  readonly msg: string = '获取商品详情失败';
}

export class ClientGetGoodsCategoryListException extends ApiException {
  readonly code: number = 405004;
  readonly msg: string = '获取游戏商品分类列表失败';
}
