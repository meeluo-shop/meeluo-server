import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Inject, Get } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { ClientPointsSettingService } from './setting.service';
import { ClientGetPointsSettingFailedException } from './setting.exception';

@ApiTags('客户端积分设置相关接口')
@Controller('client/points/setting')
export class ClientPointsSettingController {
  constructor(
    @Inject(ClientPointsSettingService)
    private settingService: ClientPointsSettingService,
  ) {}

  @Authorize()
  @Get()
  @ApiOperation({ summary: '获取积分设置' })
  @ApiErrorResponse(ClientGetPointsSettingFailedException)
  async getPointsSetting(@Identity() identity: ClientIdentity) {
    return this.settingService.getPointsSetting(identity.merchantId);
  }
}
