import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Inject, Get, Put, Body } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantMenuSettingService } from './setting.service';
import {
  MerchantMenuOrderGettingException,
  MerchantMenuOrderSettingException,
  MerchantMenuPayTypeGettingException,
  MerchantMenuPayTypeSettingException,
} from './setting.exception';
import {
  MerchantMenuOrderSettingDTO,
  MerchantMenuPayTypeSettingDTO,
} from './setting.dto';

@ApiTags('商户后台点餐菜单设置相关接口')
@Controller('merchant/menu/setting')
export class MerchantMenuSettingController {
  constructor(
    @Inject(MerchantMenuSettingService)
    private settingService: MerchantMenuSettingService,
  ) {}

  @Authorize()
  @Get('order')
  @ApiOperation({ summary: '获取点餐订单设置' })
  @ApiErrorResponse(MerchantMenuOrderGettingException)
  async getOrderSetting(@Identity() identity: MerchantIdentity) {
    return this.settingService.getOrderSetting(identity.merchantId);
  }

  @Authorize()
  @Put('order')
  @ApiOperation({ summary: '更新点餐订单设置' })
  @ApiErrorResponse(MerchantMenuOrderSettingException)
  async setOrderSetting(
    @Body() body: MerchantMenuOrderSettingDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.settingService.setOrderSetting(body, identity);
  }

  @Authorize()
  @Get('pay_type')
  @ApiOperation({ summary: '获取点餐支付方式列表' })
  @ApiErrorResponse(MerchantMenuPayTypeGettingException)
  async getPayTypeSetting(@Identity() identity: MerchantIdentity) {
    return this.settingService.getPayTypeSetting(identity.merchantId);
  }

  @Authorize()
  @Put('pay_type')
  @ApiOperation({ summary: '更新点餐支付方式列表' })
  @ApiErrorResponse(MerchantMenuPayTypeSettingException)
  async setPayTypeSetting(
    @Body() body: MerchantMenuPayTypeSettingDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.settingService.setPayTypeSetting(body, identity);
  }
}
