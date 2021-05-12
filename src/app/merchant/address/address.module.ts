import { Module } from '@nestjs/common';
import { MerchantAddressController } from './address.controller';
import { MerchantAddressService } from './address.service';

const providers = [MerchantAddressService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [MerchantAddressController],
})
export class MerchantAddressModule {}
