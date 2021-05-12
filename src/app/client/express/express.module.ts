import { Module } from '@nestjs/common';
import { ClientExpressController } from './express.controller';
import { ClientExpressService } from './express.service';


const providers = [ClientExpressService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [ClientExpressController],
})
export class ClientExpressModule {}
