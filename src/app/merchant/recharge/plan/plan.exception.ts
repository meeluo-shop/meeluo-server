import { ApiException } from '@jiaxinjiang/nest-exception';

export class AddRechargePlanException extends ApiException {
  readonly code: number = 304101;
  readonly msg: string = '增加用户充值套餐失败';
}

export class GetRechargePlanListException extends ApiException {
  readonly code: number = 304102;
  readonly msg: string = '获取用户充值套餐列表失败';
}

export class GetRechargePlanDetailException extends ApiException {
  readonly code: number = 304103;
  readonly msg: string = '获取用户充值套餐详情失败';
}

export class UpdateRechargePlanException extends ApiException {
  readonly code: number = 304104;
  readonly msg: string = '更新用户充值套餐失败';
}

export class DeleteRechargePlanException extends ApiException {
  readonly code: number = 304105;
  readonly msg: string = '删除用户充值套餐失败';
}
