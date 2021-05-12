import { Module } from '@nestjs/common';
import { ResourceModule } from '@app/common/resource';
import { MerchantCouponModule } from '@app/merchant/coupon';
import { MerchantGoodsSpecModule } from './spec';
import { MerchantGoodsCategoryModule } from './category';
import { MerchantGoodsController } from './goods.controller';
import { MerchantGoodsService } from './goods.service';

const providers = [MerchantGoodsService];
const modules = [
  ResourceModule,
  MerchantCouponModule,
  MerchantGoodsSpecModule,
  MerchantGoodsCategoryModule,
];

@Module({
  imports: modules,
  providers,
  exports: [...modules, ...providers],
  controllers: [MerchantGoodsController],
})
export class MerchantGoodsModule {}
