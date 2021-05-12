import { Controller, Inject, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import { ClientMerchantService } from './merchant.service';
import { ClientMerchantDetailException } from './merchant.exception';
import { ClientMerchantIdDTO, ClientMerchantInfoRespDTO } from './merchant.dto';

@ApiTags('客户端商户信息相关接口')
@Controller('client/merchant')
export class ClientMerchantController {
  constructor(
    @Inject(ClientMerchantService)
    private merchantService: ClientMerchantService,
  ) {}

  @Get('detail/:id')
  @ApiOperation({ summary: '获取商户详情信息' })
  @ApiOkResponse({ type: ClientMerchantInfoRespDTO })
  @ApiErrorResponse(ClientMerchantDetailException)
  async detail(@Param() { id }: ClientMerchantIdDTO) {
    return this.merchantService.detail(id);
  }
}
