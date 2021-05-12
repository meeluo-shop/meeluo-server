import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Inject, Get } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { ClientGamePrizeSettingService } from './setting.service';
import { ClientGetGamePrizeSettingException } from './setting.exception';

@ApiTags('客户端游戏奖品设置相关接口')
@Controller('client/game/prize/setting')
export class ClientGamePrizeSettingController {
  constructor(
    @Inject(ClientGamePrizeSettingService)
    private settingService: ClientGamePrizeSettingService,
  ) {}

  @Authorize()
  @Get()
  @ApiOperation({ summary: '获取游戏奖品设置' })
  @ApiErrorResponse(ClientGetGamePrizeSettingException)
  async getPointsSetting(@Identity() identity: ClientIdentity) {
    return this.settingService.getGamePrizeSetting(identity.merchantId);
  }
}
