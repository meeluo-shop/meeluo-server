import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Inject, Get, Put, Body } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantGamePrizeSettingService } from './setting.service';
import {
  MerchantGetGamePrizeSettingException,
  MerchantSetGamePrizeSettingException,
} from './setting.exception';
import { MerchantGamePrizeSettingDTO } from './setting.dto';

@ApiTags('商户后台游戏奖品设置相关接口')
@Controller('merchant/game/prize/setting')
export class MerchantGamePrizeSettingController {
  constructor(
    @Inject(MerchantGamePrizeSettingService)
    private settingService: MerchantGamePrizeSettingService,
  ) {}

  @Authorize()
  @Get()
  @ApiOperation({ summary: '获取游戏奖品设置' })
  @ApiErrorResponse(MerchantGetGamePrizeSettingException)
  async getOfficialAccount(@Identity() { merchantId }: MerchantIdentity) {
    return this.settingService.getGamePrizeSetting(merchantId);
  }

  @Authorize()
  @Put()
  @ApiOperation({ summary: '更新游戏奖品设置' })
  @ApiErrorResponse(MerchantSetGamePrizeSettingException)
  async setOfficialSetting(
    @Body() body: MerchantGamePrizeSettingDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.settingService.setGamePrizeSetting(body, identity);
  }
}
