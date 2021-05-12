import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Inject, Get, Put, Body } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantAttendantService } from './attendant.service';
import {
  MerchantAttendantGetException,
  MerchantAttendantSetException,
} from './attendant.exception';
import { MerchantAttendantDTO } from './attendant.dto';

@ApiTags('商户后台客服信息设置相关接口')
@Controller('merchant/attendant/setting')
export class MerchantAttendantController {
  constructor(
    @Inject(MerchantAttendantService)
    private attendantService: MerchantAttendantService,
  ) {}

  @Authorize()
  @Get()
  @ApiOperation({ summary: '获取客服信息' })
  @ApiErrorResponse(MerchantAttendantGetException)
  async getAttendant(@Identity() identity: MerchantIdentity) {
    return this.attendantService.getAttendant(identity.merchantId);
  }

  @Authorize()
  @Put()
  @ApiOperation({ summary: '设置客服信息' })
  @ApiErrorResponse(MerchantAttendantSetException)
  async setAttendant(
    @Body() body: MerchantAttendantDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.attendantService.setAttendant(body, identity);
  }
}
