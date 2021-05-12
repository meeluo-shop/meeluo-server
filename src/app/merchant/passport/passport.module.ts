import { Module, Global } from '@nestjs/common';
import { RegionModule } from '@app/common/region';
import { MerchantService } from '../merchant.service';
import { MerchantStaffModule } from '../staff/staff.module';
import { MerchantUserModule } from '../user/user.module';
import { MerchantPassportController } from './passport.controller';
import { MerchantPassportService } from './passport.service';

const providers = [MerchantService, MerchantPassportService];

@Global()
@Module({
  imports: [MerchantUserModule, RegionModule, MerchantStaffModule],
  providers,
  exports: providers,
  controllers: [MerchantPassportController],
})
export class MerchantPassportModule {}
