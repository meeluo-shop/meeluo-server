import { BaseService } from '@app/app.service';
import { MerchantCouponService } from '@app/merchant/coupon';
import { Inject, Injectable } from '@nestjs/common';
import { ClientCouponGrantListDTO } from './coupon.dto';

@Injectable()
export class ClientCouponService extends BaseService {
  constructor(
    @Inject(MerchantCouponService)
    private merchantCouponService: MerchantCouponService,
  ) {
    super();
  }

  /**
   * 获取优惠券列表
   * @param body
   * @param param1
   */
  async list(
    {
      expireType,
      isAvailable,
      isUsed,
      type,
      pageSize,
      pageIndex,
    }: ClientCouponGrantListDTO,
    { userId, merchantId }: ClientIdentity,
  ) {
    return this.merchantCouponService.grantList(
      {
        expireType,
        isAvailable,
        isUsed,
        type,
        pageSize,
        pageIndex,
        merchantUserId: userId,
      },
      merchantId,
    );
  }
}
