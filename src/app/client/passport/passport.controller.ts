import { Inject, Controller, Body, Post, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiCreatedResponse,
} from '@shared/swagger';
import { ClientPassportService } from './passport.service';
import {
  ClientLoginFailedException,
} from './passport.exception';
import { ClientLoginRespDTO, ClientWechatLoginDTO } from './passport.dto';
import { ClientMerchantIdDTO } from '../merchant/merchant.dto';
import { Authorize, Identity } from '@core/decorator';

@ApiTags('客户端用户授权相关接口')
@Controller('client/passport')
export class ClientPassportController {
  constructor(
    @Inject(ClientPassportService)
    private passportService: ClientPassportService,
  ) {}

  @Post('wechat/login/:id')
  @ApiOperation({ summary: '微信公众号授权登陆' })
  @ApiCreatedResponse({ type: ClientLoginRespDTO })
  @ApiErrorResponse(ClientLoginFailedException)
  async wechatMiniprogramLogin(
    @Param() { id }: ClientMerchantIdDTO,
    @Body() body: ClientWechatLoginDTO,
  ) {
    return this.passportService.wechatLogin(body, id);
  }

  @Authorize()
  @Post('logout')
  @ApiOperation({ summary: '微信客户端推出登录接口' })
  async logout(@Identity() identity: ClientIdentity) {
    return this.passportService.logout(identity.userId);
  }
}
