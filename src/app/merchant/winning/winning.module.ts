import { Module } from '@nestjs/common';
import { MerchantUserModule } from '../user/user.module';
import { RegionModule } from '@app/common/region';
import { AdminExpressModule } from '@app/admin/express';
import { MerchantWinningController } from './winning.controller';
import { MerchantWinningService } from './winning.service';
import { MerchantService } from '../merchant.service';
import { MerchantWechatModule } from '../wechat';
import { MerchantGoodsModule } from '../goods/goods.module';
import { MerchantOrderModule } from '../order/order.module';
import { MerchantGamePrizeSettingModule } from '../game/prize/setting';
import { WechatTemplateModule } from '@app/common/wechat/template';

const providers = [MerchantWinningService, MerchantService];

@Module({
  imports: [
    WechatTemplateModule,
    MerchantWechatModule,
    MerchantOrderModule,
    MerchantGoodsModule,
    AdminExpressModule,
    MerchantUserModule,
    RegionModule,
    MerchantGamePrizeSettingModule,
  ],
  providers,
  exports: providers,
  controllers: [MerchantWinningController],
})
export class MerchantWinningModule {}
