import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Inject, Get, Put, Body } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantOrderSettingService } from './setting.service';
import {
  GetMerchantOrderSettingFailedException,
  SetMerchantOrderSettingFailedException,
} from './setting.exception';
import { MerchantOrderSettingDTO } from './setting.dto';

@ApiTags('商户后台订单设置相关接口')
@Controller('merchant/order/setting')
export class MerchantOrderSettingController {
  constructor(
    @Inject(MerchantOrderSettingService)
    private settingService: MerchantOrderSettingService,
  ) {}

  @Authorize()
  @Get()
  @ApiOperation({ summary: '获取订单设置' })
  @ApiErrorResponse(GetMerchantOrderSettingFailedException)
  async getOrderSetting(@Identity() identity: MerchantIdentity) {
    return this.settingService.getOrderSetting(identity.merchantId);
  }

  @Authorize()
  @Put()
  @ApiOperation({ summary: '更新订单设置' })
  @ApiErrorResponse(SetMerchantOrderSettingFailedException)
  async setOrderSetting(
    @Body() body: MerchantOrderSettingDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.settingService.setOrderSetting(body, identity);
  }
}
