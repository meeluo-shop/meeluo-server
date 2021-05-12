import {
  Controller,
  Inject,
  Post,
  Body,
  Param,
  Put,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import { AgentMerchantService } from './merchant.service';
import { Identity, Authorize } from '@core/decorator';
import {
  AgentActiveMerchantException,
  AgentGetMerchantsFailedException,
  AgentGetMerchantDetailException,
  AgentCreateMerchantFailedException,
  AgentUpdateMerchantFailedException,
} from './merchant.exception';
import { MerchantEntity } from '@typeorm/meeluoShop';
import {
  AgentModifyMerchantDTO,
  AgentMerchantIdDTO,
  AgentMerchantListDTO,
  AgentMerchantActiveDTO,
  AgentMerchantDetailResp,
} from './merchant.dto';

@ApiTags('代理商后台商户相关接口')
@Controller('agent/merchant')
export class AgentMerchantController {
  constructor(
    @Inject(AgentMerchantService) private merchantService: AgentMerchantService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取所有商户列表' })
  @ApiOkResponse({ type: [MerchantEntity] })
  @ApiErrorResponse(AgentGetMerchantsFailedException)
  async list(
    @Query() query: AgentMerchantListDTO,
    @Identity() identity: AgentIdentity,
  ) {
    return this.merchantService.list(query, identity);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取商户详情' })
  @ApiOkResponse({ type: AgentMerchantDetailResp })
  @ApiErrorResponse(AgentGetMerchantDetailException)
  async detail(
    @Param() { id }: AgentMerchantIdDTO,
    @Identity() identity: AgentIdentity,
  ) {
    return this.merchantService.detail(id, identity);
  }

  @Authorize()
  @Put('active/:id')
  @ApiOperation({ summary: '是否启用该商户' })
  @ApiErrorResponse(AgentActiveMerchantException)
  async active(
    @Param() { id }: AgentMerchantIdDTO,
    @Body() { isActive }: AgentMerchantActiveDTO,
    @Identity() identity: AgentIdentity,
  ) {
    return this.merchantService.active(id, isActive, identity);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增商户' })
  @ApiErrorResponse(AgentCreateMerchantFailedException)
  async create(
    @Body() body: AgentModifyMerchantDTO,
    @Identity() identity: AgentIdentity,
  ) {
    return this.merchantService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改商户' })
  @ApiErrorResponse(AgentUpdateMerchantFailedException)
  async update(
    @Param() { id }: AgentMerchantIdDTO,
    @Body() body: AgentModifyMerchantDTO,
    @Identity() identity: AgentIdentity,
  ) {
    return this.merchantService.update(id, body, identity);
  }
}
