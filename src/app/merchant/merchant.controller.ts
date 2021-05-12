import { Controller, Inject, Body, Put, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { MerchantService } from './merchant.service';
import { Identity, Authorize } from '@core/decorator';
import {
  GetMerchantDetailException,
  UpdateMerchantFailedException,
} from './merchant.exception';
import { ModifyMerchantDTO } from './merchant.dto';

@ApiTags('商户后台店铺信息相关接口')
@Controller('merchant')
export class MerchantController {
  constructor(
    @Inject(MerchantService) private merchantService: MerchantService,
  ) {}

  @Authorize()
  @Get('detail')
  @ApiOperation({ summary: '获取商户详情' })
  @ApiErrorResponse(GetMerchantDetailException)
  async detail(@Identity() identity: MerchantIdentity) {
    return this.merchantService.detail(identity.merchantId);
  }

  @Authorize()
  @Put('update')
  @ApiOperation({ summary: '修改商户' })
  @ApiErrorResponse(UpdateMerchantFailedException)
  async update(
    @Body() body: ModifyMerchantDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.merchantService.update(body, identity);
  }
}
