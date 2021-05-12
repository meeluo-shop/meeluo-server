import { Module } from '@nestjs/common';
import { ClientOrderController } from './order.controller';
import { ClientOrderService } from './order.service';
import { MerchantUserModule } from '@app/merchant/user';
import { MerchantUserGradeModule } from '@app/merchant/user/grade';
import { RegionModule } from '@app/common/region';
import { ResourceModule } from '@app/common/resource';
import { MerchantGoodsSpecModule } from '@app/merchant/goods/spec';
import { MerchantGoodsModule } from '@app/merchant/goods';
import { MerchantDeliveryModule } from '@app/merchant/delivery';
import { MerchantOrderModule } from '@app/merchant/order';
import { MerchantWechatModule } from '@app/merchant/wechat';
import { MerchantCouponModule } from '@app/merchant/coupon';
import { ClientPointsSettingModule } from '../points/setting';
import { ClientCartModule } from '../cart';
import { ClientWechatModule } from '../wechat';
import { ClientRechargeModule } from '../recharge';

const providers = [ClientOrderService];

@Module({
  imports: [
    RegionModule,
    ResourceModule,
    ClientCartModule,
    ClientWechatModule,
    ClientRechargeModule,
    MerchantCouponModule,
    MerchantOrderModule,
    MerchantWechatModule,
    MerchantUserModule,
    MerchantGoodsModule,
    MerchantGoodsSpecModule,
    MerchantUserGradeModule,
    MerchantDeliveryModule,
    ClientPointsSettingModule,
  ],
  providers,
  exports: providers,
  controllers: [ClientOrderController],
})
export class ClientOrderModule {}
