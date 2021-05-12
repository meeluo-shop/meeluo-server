import { Module } from '@nestjs/common';
import { ClientAddressController } from './address.controller';
import { ClientAddressService } from './address.service';
import { RegionModule } from '@app/common/region';

const providers = [ClientAddressService];

@Module({
  imports: [RegionModule],
  providers,
  exports: providers,
  controllers: [ClientAddressController],
})
export class ClientAddressModule {}
