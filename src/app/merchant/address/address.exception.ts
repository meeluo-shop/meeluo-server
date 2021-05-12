import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateMerchantAddressFailedException extends ApiException {
  readonly code: number = 311001;
  readonly msg: string = '新增退货地址失败，请刷新页面后重新再试';
}

export class UpdateMerchantAddressFailedException extends ApiException {
  readonly code: number = 311002;
  readonly msg: string = '修改退货地址失败，请刷新页面后重新再试';
}

export class GetMerchantAddressesFailedException extends ApiException {
  readonly code: number = 311003;
  readonly msg: string = '获取退货地址列表失败，请刷新页面后重新再试';
}

export class GetMerchantAddressDetailFailedException extends ApiException {
  readonly code: number = 311004;
  readonly msg: string = '获取退货地址详情失败，请刷新页面后重新再试';
}

export class DeleteMerchantAddressFailedException extends ApiException {
  readonly code: number = 311005;
  readonly msg: string = '删除退货地址失败，请刷新页面后重新再试';
}
