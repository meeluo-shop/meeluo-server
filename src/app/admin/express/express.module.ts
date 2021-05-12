import { Module } from '@nestjs/common';
import { AdminExpressController } from './express.controller';
import { AdminExpressService } from './express.service';

const providers = [AdminExpressService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [AdminExpressController],
})
export class AdminExpressModule {}
