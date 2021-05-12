import { Module } from '@nestjs/common';
import { ClientGoodsModule } from '@app/client/goods';
import { ResourceModule } from '@app/common/resource';
import { MerchantGoodsSpecModule } from '@app/merchant/goods/spec';
import { ClientCartController } from './cart.controller';
import { ClientCartService } from './cart.service';

const providers = [ClientCartService];
const modules = [ResourceModule, ClientGoodsModule, MerchantGoodsSpecModule];

@Module({
  imports: modules,
  providers,
  exports: [...providers, ...modules],
  controllers: [ClientCartController],
})
export class ClientCartModule {}
