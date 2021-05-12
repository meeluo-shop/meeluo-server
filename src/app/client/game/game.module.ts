import { Module } from '@nestjs/common';
import { AdminGameModule, AdminGameCategoryModule } from '@app/admin/game';
import { MerchantGameModule } from '@app/merchant/game';
import { MerchantGoodsModule } from '@app/merchant/goods';
import { MerchantCouponModule } from '@app/merchant/coupon';
import { MerchantUserModule } from '@app/merchant/user';
import { MerchantWechatModule } from '@app/merchant/wechat';
import { WechatQRCodeModule } from '@app/common/wechat/qrcode';
import { WechatTemplateModule } from '@app/common/wechat/template';
import { MerchantOrderModule } from '@app/merchant/order';
import { ClientGamePrizeSettingModule } from './setting';
import { ClientUserModule } from '../user';
import { ClientRechargeModule } from '../recharge';
import { ClientWechatModule } from '../wechat';
import { ClientGameController } from './game.controller';
import { ClientGameService } from './game.service';

const providers = [ClientGameService];

@Module({
  imports: [
    MerchantOrderModule,
    MerchantUserModule,
    MerchantWechatModule,
    ClientRechargeModule,
    ClientUserModule,
    ClientWechatModule,
    MerchantGameModule,
    MerchantGoodsModule,
    MerchantCouponModule,
    AdminGameModule,
    AdminGameCategoryModule,
    WechatQRCodeModule,
    WechatTemplateModule,
    ClientGamePrizeSettingModule,
  ],
  providers,
  exports: providers,
  controllers: [ClientGameController],
})
export class ClientGameModule {}
