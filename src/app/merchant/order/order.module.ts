import { Module } from '@nestjs/common';
import { AdminExpressModule } from '@app/admin/express';
import { RegionModule } from '@app/common/region';
import { MerchantGoodsModule } from '@app/merchant/goods';
import { MerchantCouponModule } from '@app/merchant/coupon';
import { MerchantOrderController } from './order.controller';
import { MerchantOrderService } from './order.service';
import { MerchantUserModule } from '../user';
import { MerchantWechatModule } from '@app/merchant/wechat';
import { WechatTemplateModule } from '@app/common/wechat/template';
import { MerchantOrderSettingModule } from './setting';

const providers = [MerchantOrderSettingModule, MerchantOrderService];

@Module({
  imports: [
    MerchantWechatModule,
    WechatTemplateModule,
    MerchantGoodsModule,
    MerchantCouponModule,
    RegionModule,
    MerchantOrderSettingModule,
    AdminExpressModule,
    MerchantUserModule,
  ],
  providers,
  exports: providers,
  controllers: [MerchantOrderController],
})
export class MerchantOrderModule {}
