import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientCartAddFailedException extends ApiException {
  readonly code: number = 408001;
  readonly msg: string = '购物车添加商品失败';
}

export class ClientCartListFailedException extends ApiException {
  readonly code: number = 408002;
  readonly msg: string = '获取购物车商品列表失败';
}

export class ClientCartDeleteFailedException extends ApiException {
  readonly code: number = 408003;
  readonly msg: string = '购物车删除商品失败';
}

export class ClientCartDecrFailedException extends ApiException {
  readonly code: number = 408004;
  readonly msg: string = '减少购物车商品数量失败';
}

export class ClientCartCountFailedException extends ApiException {
  readonly code: number = 408005;
  readonly msg: string = '获取购物车商品数量失败';
}
