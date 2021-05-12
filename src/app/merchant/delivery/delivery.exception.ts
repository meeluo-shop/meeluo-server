import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateMerchantDeliveryFailedException extends ApiException {
  readonly code: number = 309001;
  readonly msg: string = '新增运费模板失败，请刷新页面后重新再试';
}

export class UpdateMerchantDeliveryFailedException extends ApiException {
  readonly code: number = 309002;
  readonly msg: string = '修改运费模板失败，请刷新页面后重新再试';
}

export class GetMerchantDeliverysFailedException extends ApiException {
  readonly code: number = 309003;
  readonly msg: string = '获取运费模板列表失败，请刷新页面后重新再试';
}

export class GetMerchantDeliveryDetailFailedException extends ApiException {
  readonly code: number = 309004;
  readonly msg: string = '获取运费模板详情失败，请刷新页面后重新再试';
}

export class DeleteMerchantDeliveryFailedException extends ApiException {
  readonly code: number = 309005;
  readonly msg: string = '删除运费模板失败，请刷新页面后重新再试';
}
