import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateMerchantCouponFailedException extends ApiException {
  readonly code: number = 312001;
  readonly msg: string = '新增优惠券失败，请刷新页面后重新再试';
}

export class UpdateMerchantCouponFailedException extends ApiException {
  readonly code: number = 312002;
  readonly msg: string = '修改优惠券失败，请刷新页面后重新再试';
}

export class GetMerchantCouponDetailFailedException extends ApiException {
  readonly code: number = 312003;
  readonly msg: string = '获取优惠券详情失败，请刷新页面后重新再试';
}

export class GetMerchantCouponListFailedException extends ApiException {
  readonly code: number = 312004;
  readonly msg: string = '获取优惠券列表失败，请刷新页面后重新再试';
}

export class DeleteMerchantCouponFailedException extends ApiException {
  readonly code: number = 312005;
  readonly msg: string = '删除优惠券失败，请刷新页面后重新再试';
}

export class MerchantCouponGrantFailedException extends ApiException {
  readonly code: number = 312006;
  readonly msg: string = '发放优惠券失败';
}

export class MerchantCouponExpiredException extends ApiException {
  readonly code: number = 312007;
  readonly msg: string = '优惠券已过期';
}

export class MerchantCouponNotEffectiveTimeException extends ApiException {
  readonly code: number = 312008;
  readonly msg: string = '优惠券不在有效时间段内';
}

export class MerchantCouponErrorTypeException extends ApiException {
  readonly code: number = 312009;
  readonly msg: string = '无效的优惠券类型';
}
