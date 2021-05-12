import { Module } from '@nestjs/common';
import { MerchantUserGradeModule } from './grade';
import { MerchantUserBalanceModule } from './balance';
import { MerchantUserController } from './user.controller';
import { MerchantUserService } from './user.service';

const providers = [MerchantUserService];
const modules = [MerchantUserGradeModule, MerchantUserBalanceModule];

@Module({
  imports: modules,
  providers,
  exports: [...modules, ...providers],
  controllers: [MerchantUserController],
})
export class MerchantUserModule {}
