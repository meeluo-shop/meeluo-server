import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantDevicePrinterListException extends ApiException {
  readonly code: number = 328101;
  readonly msg: string = '获取打印机列表失败';
}

export class MerchantDevicePrinterDetailException extends ApiException {
  readonly code: number = 328102;
  readonly msg: string = '获取打印机详情失败';
}

export class MerchantDevicePrinterStatusException extends ApiException {
  readonly code: number = 328103;
  readonly msg: string = '获取打印机状态失败';
}

export class MerchantDevicePrinterCreateException extends ApiException {
  readonly code: number = 328104;
  readonly msg: string = '新增打印机失败';
}

export class MerchantDevicePrinterDeleteException extends ApiException {
  readonly code: number = 328105;
  readonly msg: string = '删除打印机失败';
}

export class MerchantDevicePrinterUpdateException extends ApiException {
  readonly code: number = 328106;
  readonly msg: string = '修改打印机失败';
}

export class MerchantDevicePrinterKeyExistsException extends ApiException {
  readonly code: number = 328107;
  readonly msg: string = '当前设备编号已存在';
}
