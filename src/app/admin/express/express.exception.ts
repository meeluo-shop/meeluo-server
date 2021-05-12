import { ApiException } from '@jiaxinjiang/nest-exception';

export class AdminExpressCreateException extends ApiException {
  readonly code: number = 904001;
  readonly msg: string = '新增物流公司失败，请刷新页面后重新再试';
}

export class AdminExpressUpdateException extends ApiException {
  readonly code: number = 904002;
  readonly msg: string = '修改物流公司失败，请刷新页面后重新再试';
}

export class AdminExpressGetListException extends ApiException {
  readonly code: number = 904003;
  readonly msg: string = '获取物流公司列表失败，请刷新页面后重新再试';
}

export class AdminExpressGetDetailException extends ApiException {
  readonly code: number = 904004;
  readonly msg: string = '获取物流公司详情失败，请刷新页面后重新再试';
}

export class AdminExpressDeleteException extends ApiException {
  readonly code: number = 904005;
  readonly msg: string = '删除物流公司失败，请刷新页面后重新再试';
}
