import { Inject, Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiCreatedResponse,
} from '@shared/swagger';
import { ClientWechatService } from './wechat.service';
import {
  ClientWechatJSSDKConfigDTO,
  ClientWechatJSSDKConfigParamsDTO,
} from './wechat.dto';
import { ClientWechatGetJSSDKConfigException } from './wechat.exception';

@ApiTags('客户端微信相关接口')
@Controller('client/wechat')
export class ClientWechatController {
  constructor(
    @Inject(ClientWechatService)
    private wechatService: ClientWechatService,
  ) {}

  @Post('jssdk/config')
  @ApiOperation({ summary: '获取微信jssdk配置' })
  @ApiCreatedResponse({ type: ClientWechatJSSDKConfigDTO })
  @ApiErrorResponse(ClientWechatGetJSSDKConfigException)
  async checkStaff(@Body() body: ClientWechatJSSDKConfigParamsDTO) {
    return this.wechatService.getJSSDKConfig(body);
  }
}
