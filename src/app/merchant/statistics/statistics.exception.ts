import { ApiException } from '@jiaxinjiang/nest-exception';

export class MerchantStatisticsBaseCountException extends ApiException {
  readonly code: number = 327001;
  readonly msg: string = '获取商家基础数量统计失败';
}

export class MerchantStatisticsSaleVolumeException extends ApiException {
  readonly code: number = 327002;
  readonly msg: string = '获取商家销售额统计失败';
}
