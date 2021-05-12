import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Inject, Get } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantAttendantService } from '@app/merchant/attendant';
import { ClientAttendantGetException } from './attendant.exception';

@ApiTags('客户端客服信息相关接口')
@Controller('client/attendant/setting')
export class ClientAttendantController {
  constructor(
    @Inject(MerchantAttendantService)
    private attendantService: MerchantAttendantService,
  ) {}

  @Authorize()
  @Get()
  @ApiOperation({ summary: '获取客服信息' })
  @ApiErrorResponse(ClientAttendantGetException)
  async getPointsSetting(@Identity() identity: ClientIdentity) {
    return this.attendantService.getAttendant(identity.merchantId);
  }
}
