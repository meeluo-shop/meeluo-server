import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateAdminGameFailedException extends ApiException {
  readonly code: number = 109001;
  readonly msg: string = '创建游戏失败，请刷新页面后重新再试';
}

export class UpdateAdminGameFailedException extends ApiException {
  readonly code: number = 109002;
  readonly msg: string = '修改游戏失败，请刷新页面后重新再试';
}

export class GetAdminGameListFailedException extends ApiException {
  readonly code: number = 109003;
  readonly msg: string = '获取游戏列表失败，请刷新页面后重新再试';
}

export class GetAdminGameDetailFailedException extends ApiException {
  readonly code: number = 109004;
  readonly msg: string = '获取游戏详情失败，请刷新页面后重新再试';
}

export class DeleteAdminGameFailedException extends ApiException {
  readonly code: number = 109005;
  readonly msg: string = '删除游戏失败，请刷新页面后重新再试';
}

export class AdminGameNotAllowDeleteException extends ApiException {
  readonly code: number = 109006;
  readonly msg: string = '该游戏已被商户使用，无法删除';
}

export class AdminGameNameRepeatException extends ApiException {
  readonly code: number = 109007;
  readonly msg: string = '当前游戏名称已存在，请更换名称';
}

export class AdminGameSetSessionException extends ApiException {
  readonly code: number = 109009;
  readonly msg: string = '生成游戏会话失败';
}
