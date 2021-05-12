import { Module } from '@nestjs/common';
import { MerchantUserModule } from '../user/user.module';
import { MerchantStaffController } from './staff.controller';
import { MerchantStaffService } from './staff.service';

const providers = [MerchantStaffService];

@Module({
  imports: [MerchantUserModule],
  providers,
  exports: providers,
  controllers: [MerchantStaffController],
})
export class MerchantStaffModule {}
