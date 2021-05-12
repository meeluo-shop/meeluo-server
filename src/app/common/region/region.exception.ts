import { ApiException } from '@jiaxinjiang/nest-exception';

export class GetRegionFailedException extends ApiException {
  readonly code: number = 901001;
  readonly msg: string = '地区信息获取失败，请刷新页面后重试';
}
