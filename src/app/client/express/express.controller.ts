import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import {
  Controller,
  Inject,
  Get,
  Query,
} from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { ClientExpressService } from './express.service'
import { ClientExpressQueryNoDTO, ClientExpressQueryNoRespDTO } from './express.dto'
import { ClientExpressQueryNoException } from './express.exception'

@ApiTags('客户端订单物流相关接口')
@Controller('client/express')
export class ClientExpressController {
  constructor(
    @Inject(ClientExpressService)
    private expressService: ClientExpressService,
  ) {}

  @Authorize()
  @Get('query')
  @ApiOperation({ summary: '查询物流单号' })
  @ApiOkResponse({ type: [ClientExpressQueryNoRespDTO] })
  @ApiErrorResponse(ClientExpressQueryNoException)
  async query(
    @Query() query: ClientExpressQueryNoDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.expressService.queryNo(query, identity);
  }
}
