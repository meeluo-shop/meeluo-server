import { Module } from '@nestjs/common';
import { AgentMerchantController } from './merchant.controller';
import { AgentMerchantService } from './merchant.service';

const providers = [AgentMerchantService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [AgentMerchantController],
})
export class AgentMerchantModule {}
