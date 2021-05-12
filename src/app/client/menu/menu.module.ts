import { Module } from '@nestjs/common';
import { ClientMenuController } from './menu.controller';
import { ClientMenuService } from './menu.service';
import { MerchantUserModule } from '@app/merchant/user';
import { MerchantUserGradeModule } from '@app/merchant/user/grade';
import { RegionModule } from '@app/common/region';
import { ResourceModule } from '@app/common/resource';
import { MerchantGoodsSpecModule } from '@app/merchant/goods/spec';
import { MerchantGoodsModule } from '@app/merchant/goods';
import { MerchantDeliveryModule } from '@app/merchant/delivery';
import { MerchantOrderModule } from '@app/merchant/order';
import { MerchantMenuModule } from '@app/merchant/menu';
import { MerchantWechatModule } from '@app/merchant/wechat';
import { MerchantCouponModule } from '@app/merchant/coupon';
import { ClientPointsSettingModule } from '../points/setting';
import { ClientCartModule } from '../cart';
import { ClientWechatModule } from '../wechat';
import { ClientRechargeModule } from '../recharge';

const providers = [ClientMenuService];

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
    MerchantMenuModule,
    MerchantUserModule,
    MerchantGoodsModule,
    MerchantGoodsSpecModule,
    MerchantUserGradeModule,
    MerchantDeliveryModule,
    ClientPointsSettingModule,
  ],
  providers,
  exports: providers,
  controllers: [ClientMenuController],
})
export class ClientMenuModule {}
