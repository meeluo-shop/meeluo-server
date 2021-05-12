import { AgentMerchantModule } from './merchant';
import { AgentPassportModule } from './passport';
import { AgentSettingModule } from './setting';
import { AuthModule } from '@core/decorator';
import { AGENT_TOKEN_HEADER } from '@core/constant';

const modules = [AgentSettingModule, AgentMerchantModule, AgentPassportModule];

@AuthModule({
  header: AGENT_TOKEN_HEADER,
  imports: modules,
  providers: [],
  exports: modules,
  controllers: [],
})
export class AgentModule {}
