import { Module } from '@nestjs/common';
import { AdminExpressModule } from '@app/admin/express';
import { RegionModule } from '@app/common/region';
import { ResourceModule } from '@app/common/resource';
import { MerchantMenuOrderController } from './order.controller';
import { MerchantMenuOrderService } from './order.service';
import { MerchantGoodsSpecModule } from '@app/merchant/goods/spec';
import { MerchantGoodsModule } from '@app/merchant/goods';
import { MerchantUserModule } from '@app/merchant/user';
import { MerchantCouponModule } from '@app/merchant/coupon';
import { MerchantOrderModule } from '@app/merchant/order';
import { MerchantWechatModule } from '@app/merchant/wechat';
import { MerchantDeviceModule } from '@app/merchant/device';
import { MerchantUserGradeModule } from '@app/merchant/user/grade';
import { WechatTemplateModule } from '@app/common/wechat/template';
import { MerchantMenuSettingModule } from '../setting';

const providers = [MerchantMenuOrderService];

@Module({
  imports: [
    MerchantDeviceModule,
    MerchantCouponModule,
    MerchantWechatModule,
    WechatTemplateModule,
    MerchantOrderModule,
    MerchantGoodsModule,
    MerchantGoodsSpecModule,
    MerchantUserGradeModule,
    RegionModule,
    ResourceModule,
    MerchantMenuSettingModule,
    AdminExpressModule,
    MerchantUserModule,
  ],
  providers,
  exports: providers,
  controllers: [MerchantMenuOrderController],
})
export class MerchantMenuOrderModule {}
