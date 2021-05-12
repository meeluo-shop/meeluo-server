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
import { AdminMerchantService } from './merchant.service';
import { WRITE_ADMIN_MERCHANT, READ_ADMIN_MERCHANT } from '../permission';
import { Permissions, Identity } from '@core/decorator';
import {
  ActiveMerchantDetailException,
  GetMerchantsFailedException,
  GetMerchantDetailException,
  CreateMerchantFailedException,
  UpdateMerchantFailedException,
} from './merchant.exception';
import { MerchantEntity } from '@typeorm/meeluoShop';
import {
  AdminModifyMerchantDTO,
  AdminMerchantIdDTO,
  AdminMerchantListDTO,
  AdminMerchantActiveDTO,
  AdminMerchantDetailResp,
} from './merchant.dto';

@ApiTags('管理员后台商户相关接口')
@Controller('admin/merchant')
export class AdminMerchantController {
  constructor(
    @Inject(AdminMerchantService) private merchantService: AdminMerchantService,
  ) {}

  @Permissions(READ_ADMIN_MERCHANT)
  @Get('list')
  @ApiOperation({ summary: '获取所有商户列表' })
  @ApiOkResponse({ type: [MerchantEntity] })
  @ApiErrorResponse(GetMerchantsFailedException)
  async list(@Query() query: AdminMerchantListDTO) {
    return this.merchantService.list(query);
  }

  @Permissions(READ_ADMIN_MERCHANT)
  @Get('detail/:id')
  @ApiOperation({ summary: '获取商户详情' })
  @ApiOkResponse({ type: AdminMerchantDetailResp })
  @ApiErrorResponse(GetMerchantDetailException)
  async detail(@Param() { id }: AdminMerchantIdDTO) {
    return this.merchantService.detail(id);
  }

  @Permissions(WRITE_ADMIN_MERCHANT)
  @Put('active/:id')
  @ApiOperation({ summary: '是否启用该商户' })
  @ApiErrorResponse(ActiveMerchantDetailException)
  async active(
    @Param() { id }: AdminMerchantIdDTO,
    @Body() { isActive }: AdminMerchantActiveDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.merchantService.active(id, isActive, identity);
  }

  @Permissions(WRITE_ADMIN_MERCHANT)
  @Post('create')
  @ApiOperation({ summary: '新增商户' })
  @ApiErrorResponse(CreateMerchantFailedException)
  async create(
    @Body() body: AdminModifyMerchantDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.merchantService.create(body, identity);
  }

  @Permissions(WRITE_ADMIN_MERCHANT)
  @Put('update/:id')
  @ApiOperation({ summary: '修改商户' })
  @ApiErrorResponse(UpdateMerchantFailedException)
  async update(
    @Param() { id }: AdminMerchantIdDTO,
    @Body() body: AdminModifyMerchantDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.merchantService.update(id, body, identity);
  }
}
