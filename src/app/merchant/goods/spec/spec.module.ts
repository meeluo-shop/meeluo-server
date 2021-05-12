import { Module } from '@nestjs/common';
import { MerchantGoodsSpecController } from './spec.controller';
import { MerchantGoodsSpecService } from './spec.service';

const providers = [MerchantGoodsSpecService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [MerchantGoodsSpecController],
})
export class MerchantGoodsSpecModule {}
