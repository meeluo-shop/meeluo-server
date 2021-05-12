import { Module } from '@nestjs/common';
import { MerchantSettingModule } from '@app/merchant/setting';
import { MerchantAttendantController } from './attendant.controller';
import { MerchantAttendantService } from './attendant.service';

const providers = [MerchantAttendantService];

@Module({
  imports: [MerchantSettingModule],
  providers,
  exports: providers,
  controllers: [MerchantAttendantController],
})
export class MerchantAttendantModule {}
