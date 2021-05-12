import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateAgentFailedException extends ApiException {
  readonly code: number = 107001;
  readonly msg: string = '新增代理商失败，请刷新页面后重试';
}

export class PhoneRepeatFailedException extends ApiException {
  readonly code: number = 107002;
  readonly msg: string = '手机号码已被使用';
}

export class EmailRepeatFailedException extends ApiException {
  readonly code: number = 107003;
  readonly msg: string = '电子邮箱已被使用';
}

export class UpdateAgentFailedException extends ApiException {
  readonly code: number = 107004;
  readonly msg: string = '修改代理商失败，请刷新页面后重试';
}

export class AgentAdminNoExistException extends ApiException {
  readonly code: number = 107005;
  readonly msg: string = '代理商管理员不存在，请联系客服人员反馈';
}

export class GetAgentDetailException extends ApiException {
  readonly code: number = 107006;
  readonly msg: string = '获取代理商详情失败，请刷新页面后重试';
}

export class GetAgentsFailedException extends ApiException {
  readonly code: number = 107007;
  readonly msg: string = '获取代理商列表失败，请刷新页面后重试';
}

export class ActiveAgentDetailException extends ApiException {
  readonly code: number = 107008;
  readonly msg: string = '更新代理商状态失败，请刷新页面后重试';
}
