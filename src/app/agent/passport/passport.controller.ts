import { Inject, Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { AgentPassportService } from './passport.service';
import { AgentLoginDTO } from './passport.dto';
import { AgentLoginFailedException } from './passport.exception';
import { Authorize, Identity } from '@core/decorator';

@ApiTags('代理商后台身份认证相关接口')
@Controller('agent/passport')
export class AgentPassportController {
  constructor(
    @Inject(AgentPassportService)
    private passportService: AgentPassportService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '代理商后台登陆接口' })
  @ApiErrorResponse(AgentLoginFailedException)
  async login(@Body() body: AgentLoginDTO) {
    return this.passportService.login(body);
  }

  @Authorize()
  @Post('logout')
  @ApiOperation({ summary: '代理商后台退出登录接口' })
  async logout(@Identity() identity: AgentIdentity) {
    return this.passportService.logout(identity.user.id);
  }
}
