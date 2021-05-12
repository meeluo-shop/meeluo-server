import { Controller, Inject, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Identity, Authorize } from '@core/decorator';
import {
  MerchantWechatGetMerchantQRCodeException,
  MerchantWechatGetTableQRCodeException,
} from './qrcode.exception';
import { MerchantWechatQRCodeService } from './qrcode.service';
import { MerchantTableIdDTO } from '@app/merchant/table/table.dto';

@ApiTags('商户后台微信二维码相关接口')
@Controller('merchant/wechat/qrcode')
export class MerchantWechatQRCodeController {
  constructor(
    @Inject(MerchantWechatQRCodeService)
    private wechatQRCodeService: MerchantWechatQRCodeService,
  ) {}

  @Authorize()
  @Get('merchant')
  @ApiOperation({ summary: '获取商户公众号二维码' })
  @ApiErrorResponse(MerchantWechatGetMerchantQRCodeException)
  async getMerchantQRCode(
    @Identity() { merchantId, userId }: MerchantIdentity,
  ) {
    return this.wechatQRCodeService.getMerchantQRCode(merchantId, userId);
  }

  @Authorize()
  @Get('table/:id')
  @ApiOperation({ summary: '获取餐桌公众号二维码' })
  @ApiErrorResponse(MerchantWechatGetTableQRCodeException)
  async getTableQRCode(
    @Param() { id }: MerchantTableIdDTO,
    @Identity() { merchantId, userId }: MerchantIdentity,
  ) {
    return this.wechatQRCodeService.getTableQRCode(id, merchantId, userId);
  }
}
