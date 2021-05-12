import { Module } from '@nestjs/common';
import { AdminExpressModule } from '@app/admin/express';
import { MerchantUserService } from '@app/merchant/user/user.service';
import { MerchantUserGradeModule } from '../grade';
import { MerchantUserBalanceController } from './balance.controller';
import { MerchantUserBalanceService } from './balance.service';

const providers = [MerchantUserService, MerchantUserBalanceService];

@Module({
  imports: [AdminExpressModule, MerchantUserGradeModule],
  providers,
  exports: providers,
  controllers: [MerchantUserBalanceController],
})
export class MerchantUserBalanceModule {}
