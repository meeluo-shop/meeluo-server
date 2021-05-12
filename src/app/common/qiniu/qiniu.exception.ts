import { ApiException } from '@jiaxinjiang/nest-exception';

export class GetQiniuTokenFailedException extends ApiException {
  readonly code: number = 903001;
  readonly msg: string = '获取上传凭证失败，请刷新页面重新再试';
}
