import { Module } from '@nestjs/common';
import {
  MerchantGoodsModule,
  MerchantGoodsCategoryModule,
} from '@app/merchant/goods';
import { MerchantGameModule } from '@app/merchant/game';
import { ClientGoodsController } from './goods.controller';
import { ClientGoodsService } from './goods.service';

const providers = [ClientGoodsService];

@Module({
  imports: [
    MerchantGameModule,
    MerchantGoodsModule,
    MerchantGoodsCategoryModule,
  ],
  providers,
  exports: providers,
  controllers: [ClientGoodsController],
})
export class ClientGoodsModule {}
