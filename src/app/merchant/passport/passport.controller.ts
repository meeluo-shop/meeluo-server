import { Inject, Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { MerchantPassportService } from './passport.service';
import { MerchantLoginDTO } from './passport.dto';
import { MerchantLoginFailedException } from './passport.exception';
import { Authorize, Identity } from '@core/decorator';

@ApiTags('商户后台身份认证相关接口')
@Controller('merchant/passport')
export class MerchantPassportController {
  constructor(
    @Inject(MerchantPassportService)
    private passportService: MerchantPassportService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '商户后台登陆接口' })
  @ApiErrorResponse(MerchantLoginFailedException)
  async login(@Body() body: MerchantLoginDTO) {
    return this.passportService.login(body);
  }

  @Authorize()
  @Post('logout')
  @ApiOperation({ summary: '商户后台退出登录接口' })
  async logout(@Identity() identity: MerchantIdentity) {
    return this.passportService.logout(identity.user.id);
  }
}
