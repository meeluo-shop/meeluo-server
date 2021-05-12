import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Inject, Get, Put, Body } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantPointsSettingService } from './setting.service';
import {
  GetMerchantPointsSettingFailedException,
  SetMerchantPointsSettingFailedException,
} from './setting.exception';
import { MerchantPointsSettingDTO } from './setting.dto';

@ApiTags('商户后台积分设置相关接口')
@Controller('merchant/points/setting')
export class MerchantPointsSettingController {
  constructor(
    @Inject(MerchantPointsSettingService)
    private settingService: MerchantPointsSettingService,
  ) {}

  @Authorize()
  @Get()
  @ApiOperation({ summary: '获取积分设置' })
  @ApiErrorResponse(GetMerchantPointsSettingFailedException)
  async getPointsSetting(@Identity() identity: MerchantIdentity) {
    return this.settingService.getPointsSetting(identity.merchantId);
  }

  @Authorize()
  @Put()
  @ApiOperation({ summary: '更新积分设置' })
  @ApiErrorResponse(SetMerchantPointsSettingFailedException)
  async setPointsSetting(
    @Body() body: MerchantPointsSettingDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.settingService.setPointsSetting(body, identity);
  }
}
