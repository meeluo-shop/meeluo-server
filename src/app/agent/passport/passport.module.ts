import { Module, Global } from '@nestjs/common';
import { AgentPassportController } from './passport.controller';
import { AgentPassportService } from './passport.service';

const providers = [AgentPassportService];

@Global()
@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [AgentPassportController],
})
export class AgentPassportModule {}
