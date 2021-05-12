import { Module } from '@nestjs/common';
import { ClientOrderModule } from '@app/client/order';
import { ClientMenuModule } from '@app/client/menu';
import { MerchantWinningModule } from '@app/merchant/winning';
import { MerchantMenuOrderModule } from '@app/merchant/menu/order';
import { OrderConsumer } from './order.consumer';

const providers = [OrderConsumer];

@Module({
  imports: [
    MerchantWinningModule,
    MerchantMenuOrderModule,
    ClientMenuModule,
    ClientOrderModule,
  ],
  providers,
  exports: providers,
  controllers: [],
})
export class OrderConsumerModule {}
