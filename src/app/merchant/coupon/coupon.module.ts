import { Module } from '@nestjs/common';
import { MerchantCouponController } from './coupon.controller';
import { MerchantCouponService } from './coupon.service';
import { MerchantUserModule } from '../user';

const providers = [MerchantCouponService];
const modules = [];

@Module({
  imports: [MerchantUserModule],
  providers,
  exports: [...providers, ...modules],
  controllers: [MerchantCouponController],
})
export class MerchantCouponModule {}
