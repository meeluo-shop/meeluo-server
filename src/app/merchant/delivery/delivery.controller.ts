import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import {
  Controller,
  Inject,
  Post,
  Body,
  Put,
  Param,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantDeliveryService } from './delivery.service';
import {
  ModifyMerchantDeliveryDTO,
  MerchantDeliveryIdDTO,
  MerchantDeliveryListDTO,
} from './delivery.dto';
import {
  GetMerchantDeliverysFailedException,
  CreateMerchantDeliveryFailedException,
  UpdateMerchantDeliveryFailedException,
  DeleteMerchantDeliveryFailedException,
  GetMerchantDeliveryDetailFailedException,
} from './delivery.exception';
import { MerchantDeliveryEntity } from '@typeorm/meeluoShop';

@ApiTags('商户后台运费模版相关接口')
@Controller('merchant/delivery')
export class MerchantDeliveryController {
  constructor(
    @Inject(MerchantDeliveryService)
    private deliveryService: MerchantDeliveryService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取运费模板列表' })
  @ApiOkResponse({ type: [MerchantDeliveryEntity] })
  @ApiErrorResponse(GetMerchantDeliverysFailedException)
  async list(
    @Query() query: MerchantDeliveryListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.deliveryService.list(query, identity);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '查看运费模版详情' })
  @ApiErrorResponse(GetMerchantDeliveryDetailFailedException)
  async detail(
    @Param() { id }: MerchantDeliveryIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.deliveryService.detail(id, identity);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增运费模版' })
  @ApiErrorResponse(CreateMerchantDeliveryFailedException)
  async create(
    @Body() body: ModifyMerchantDeliveryDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.deliveryService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改运费模版' })
  @ApiErrorResponse(UpdateMerchantDeliveryFailedException)
  async update(
    @Param() { id }: MerchantDeliveryIdDTO,
    @Body() body: ModifyMerchantDeliveryDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.deliveryService.update(id, body, identity);
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除运费模版' })
  @ApiErrorResponse(DeleteMerchantDeliveryFailedException)
  async delete(
    @Param() { id }: MerchantDeliveryIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.deliveryService.delete(id, identity);
  }
}
