import { ApiException } from '@jiaxinjiang/nest-exception';

export class YiLianGetTokenException extends ApiException {
  readonly code: number = 2000101;
  readonly msg: string = '获取打印设备token失败';
}

export class YiLianAddPrinterException extends ApiException {
  readonly code: number = 2000102;
  readonly msg: string = '添加打印机授权失败';
}

export class YiLianDeletePrinterException extends ApiException {
  readonly code: number = 2000103;
  readonly msg: string = '删除打印机授权失败';
}

export class YiLianGetPrinterStatusException extends ApiException {
  readonly code: number = 2000104;
  readonly msg: string = '获取打印机状态失败';
}

export class YiLianPrintImageException extends ApiException {
  readonly code: number = 2000108;
  readonly msg: string = '打印图片失败';
}

export class YiLianPrintTextException extends ApiException {
  readonly code: number = 2000109;
  readonly msg: string = '打印文本失败';
}
