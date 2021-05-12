import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Inject, Get, Put, Body } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantDeliverySettingService } from './setting.service';
import {
  GetMerchantDeliverySettingFailedException,
  SetMerchantDeliverySettingFailedException,
} from './setting.exception';
import { MerchantDeliverySettingDTO } from './setting.dto';

@ApiTags('商户后台配送运费设置相关接口')
@Controller('merchant/delivery/setting')
export class MerchantDeliverySettingController {
  constructor(
    @Inject(MerchantDeliverySettingService)
    private settingService: MerchantDeliverySettingService,
  ) {}

  @Authorize()
  @Get()
  @ApiOperation({ summary: '获取运费设置' })
  @ApiErrorResponse(GetMerchantDeliverySettingFailedException)
  async getSetting(@Identity() identity: MerchantIdentity) {
    return this.settingService.getSetting(identity.merchantId);
  }

  @Authorize()
  @Put()
  @ApiOperation({ summary: '更新运费设置' })
  @ApiErrorResponse(SetMerchantDeliverySettingFailedException)
  async setSetting(
    @Body() body: MerchantDeliverySettingDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.settingService.setSetting(body, identity);
  }
}
