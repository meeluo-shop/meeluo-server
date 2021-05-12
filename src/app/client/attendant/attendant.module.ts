import { Module } from '@nestjs/common';
import { MerchantAttendantModule } from '@app/merchant/attendant';
import { ClientAttendantController } from './attendant.controller';

const providers = [];

@Module({
  imports: [MerchantAttendantModule],
  providers,
  exports: providers,
  controllers: [ClientAttendantController],
})
export class ClientAttendantModule {}
