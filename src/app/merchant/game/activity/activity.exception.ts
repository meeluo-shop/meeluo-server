import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateMerchantGameFailedException extends ApiException {
  readonly code: number = 313101;
  readonly msg: string = '新增游戏活动失败，请刷新页面后重新再试';
}

export class UpdateMerchantGameFailedException extends ApiException {
  readonly code: number = 313102;
  readonly msg: string = '修改游戏活动失败，请刷新页面后重新再试';
}

export class GetMerchantGameDetailFailedException extends ApiException {
  readonly code: number = 313103;
  readonly msg: string = '获取游戏活动详情失败，请刷新页面后重新再试';
}

export class GetMerchantGameListFailedException extends ApiException {
  readonly code: number = 313104;
  readonly msg: string = '获取游戏活动列表失败，请刷新页面后重新再试';
}

export class DeleteMerchantGameFailedException extends ApiException {
  readonly code: number = 313105;
  readonly msg: string = '删除游戏活动失败，请刷新页面后重新再试';
}

export class CheckMerchantGameStatusFailedException extends ApiException {
  readonly code: number = 313106;
  readonly msg: string = '检验游戏活动状态失败，请刷新页面后重新再试';
}

export class MerchantGameExistsException extends ApiException {
  readonly code: number = 313107;
  readonly msg: string = '该游戏活动已存在，请选择其他游戏';
}
