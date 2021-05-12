import { Module } from '@nestjs/common';
import { AdminGameModule, AdminGameCategoryModule } from '@app/admin/game';
import { MerchantGoodsModule } from '@app/merchant/goods';
import { MerchantCouponModule } from '@app/merchant/coupon';
import { MerchantGamePrizeController, MerchantGamePrizeService } from './prize';
import { MerchantGamePrizeSettingModule } from './prize/setting';
import { MerchantUserModule } from '../user';
import {
  MerchantGameActivityController,
  MerchantGameActivityService,
} from './activity';
import { MerchantGameController } from './game.controller';
import { MerchantGameService } from './game.service';

const providers = [
  MerchantGameService,
  MerchantGamePrizeService,
  MerchantGameActivityService,
];
const modules = [
  MerchantUserModule,
  MerchantCouponModule,
  AdminGameModule,
  AdminGameCategoryModule,
  MerchantGoodsModule,
  MerchantGamePrizeSettingModule,
];

@Module({
  imports: modules,
  providers,
  exports: [...modules, ...providers],
  controllers: [
    MerchantGameController,
    MerchantGamePrizeController,
    MerchantGameActivityController,
  ],
})
export class MerchantGameModule {}
