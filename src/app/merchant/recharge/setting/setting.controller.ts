import { Inject, Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Authorize, Identity } from '@core/decorator';
import { MerchantRechargeSettingService } from './setting.service';
import {
  MerchantRechargeGettingException,
  MerchantRechargeSettingException,
} from './setting.exception';
import { MerchantRechargeSettingDTO } from './setting.dto';

@ApiTags('商户后台用户充值设置相关接口')
@Controller('merchant/recharge/setting')
export class MerchantRechargeSettingController {
  constructor(
    @Inject(MerchantRechargeSettingService)
    private settingService: MerchantRechargeSettingService,
  ) {}

  @Authorize()
  @Get()
  @ApiOperation({ summary: '获取用户充值设置' })
  @ApiErrorResponse(MerchantRechargeGettingException)
  async getRechargeSetting(@Identity() identity: MerchantIdentity) {
    return this.settingService.getRechargeSetting(identity.merchantId);
  }

  @Authorize()
  @Put()
  @ApiOperation({ summary: '修改用户充值设置' })
  @ApiErrorResponse(MerchantRechargeSettingException)
  async setRechargeSetting(
    @Body() body: MerchantRechargeSettingDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.settingService.setRechargeSetting(body, identity);
  }
}
