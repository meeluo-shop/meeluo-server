import { Inject, Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Authorize, Identity } from '@core/decorator';
import { AdminPassportService } from './passport.service';
import { AdminLoginDTO, GenerateAdminDTO } from './passport.dto';
import {
  AdminLoginFailedException,
  AdminRefreshFailedException,
} from './passport.exception';

@ApiTags('管理员后台身份认证相关接口')
@Controller('admin/passport')
export class AdminPassportController {
  constructor(
    @Inject(AdminPassportService) private passportService: AdminPassportService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '管理员后台登陆接口' })
  @ApiErrorResponse(AdminLoginFailedException)
  async login(@Body() body: AdminLoginDTO) {
    return this.passportService.login(body);
  }

  @Authorize()
  @Post('refresh')
  @ApiOperation({ summary: '管理员后台更新用户登陆信息接口' })
  @ApiErrorResponse(AdminRefreshFailedException)
  async refresh(@Identity() identity: AdminIdentity) {
    return this.passportService.refreshToken(identity);
  }

  @Authorize()
  @Post('logout')
  @ApiOperation({ summary: '管理员后台退出登录接口' })
  async logout(@Identity() { user }: AdminIdentity) {
    return this.passportService.logout(user.id);
  }

  @Post('system_admin/generate')
  @ApiOperation({ summary: '生成系统管理员' })
  async genSystemAdmin(@Body() body: GenerateAdminDTO) {
    return this.passportService.generateSystemAdmin(body);
  }
}
