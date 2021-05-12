import { ApiException } from '@jiaxinjiang/nest-exception';

export class ClientAddressCreateException extends ApiException {
  readonly code: number = 410001;
  readonly msg: string = '新增收货地址失败';
}

export class ClientAddressUpdateException extends ApiException {
  readonly code: number = 410002;
  readonly msg: string = '修改收货地址失败';
}

export class ClientAddressDeleteException extends ApiException {
  readonly code: number = 410003;
  readonly msg: string = '删除收货地址失败';
}

export class ClientAddressListException extends ApiException {
  readonly code: number = 410004;
  readonly msg: string = '获取收货地址列表失败';
}
