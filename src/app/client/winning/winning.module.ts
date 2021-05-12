import { Module } from '@nestjs/common';
import { RegionModule } from '@app/common/region';
import { MerchantWinningModule } from '@app/merchant/winning';
import { MerchantWechatModule } from '@app/merchant/wechat';
import { ClientWinningController } from './winning.controller';
import { ClientWinningService } from './winning.service';

const providers = [ClientWinningService];

@Module({
  imports: [MerchantWinningModule, RegionModule, MerchantWechatModule],
  providers,
  exports: providers,
  controllers: [ClientWinningController],
})
export class ClientWinningModule {}
