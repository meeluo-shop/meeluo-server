import { Module } from '@nestjs/common';
import { MerchantCouponModule } from '@app/merchant/coupon';
import { ClientCouponController } from './coupon.controller';
import { ClientCouponService } from './coupon.service';

const providers = [ClientCouponService];

@Module({
  imports: [MerchantCouponModule],
  providers,
  exports: providers,
  controllers: [ClientCouponController],
})
export class ClientCouponModule {}
