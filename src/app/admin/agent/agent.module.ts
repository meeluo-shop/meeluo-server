import { Module } from '@nestjs/common';
import { AdminAgentController } from './agent.controller';
import { AdminAgentService } from './agent.service';

const providers = [AdminAgentService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [AdminAgentController],
})
export class AdminAgentModule {}
