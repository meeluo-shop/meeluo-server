import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiCreatedResponse,
} from '@shared/swagger';
import {
  Controller,
  Inject,
  Get,
  Query,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantGoodsEntity } from '@typeorm/meeluoShop';
import {
  MerchantGoodsListDTO,
  ModifyMerchantGoodsDTO,
  MerchantGoodsIdDTO,
  MerchantGoodsActiveDTO,
  MerchantGoodsIdsDTO,
} from './goods.dto';
import { MerchantGoodsService } from './goods.service';
import {
  GetMerchantGoodsListFailedException,
  CreateMerchantGoodsFailedException,
  UpdateMerchantGoodsFailedException,
  DeleteMerchantGoodsFailedException,
  GetMerchantGoodsDetailFailedException,
  ActiveMerchantGoodsFailedException,
} from './goods.exception';

@ApiTags('商户后台商品管理相关接口')
@Controller('merchant/goods')
export class MerchantGoodsController {
  constructor(
    @Inject(MerchantGoodsService)
    private goodsService: MerchantGoodsService,
  ) {}

  @Authorize()
  @Post('list')
  @ApiOperation({ summary: '获取商品列表' })
  @ApiCreatedResponse({ type: [MerchantGoodsEntity] })
  @ApiErrorResponse(GetMerchantGoodsListFailedException)
  async list(
    @Query() query: MerchantGoodsListDTO,
    @Body() body: MerchantGoodsIdsDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    return this.goodsService.list(query, body, merchantId);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取商品详情' })
  @ApiErrorResponse(GetMerchantGoodsDetailFailedException)
  async detail(
    @Param() { id }: MerchantGoodsIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.goodsService.detail(id, identity.merchantId);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '创建商品' })
  @ApiErrorResponse(CreateMerchantGoodsFailedException)
  async create(
    @Body() body: ModifyMerchantGoodsDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.goodsService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改商品' })
  @ApiErrorResponse(UpdateMerchantGoodsFailedException)
  async update(
    @Param() { id }: MerchantGoodsIdDTO,
    @Body() body: ModifyMerchantGoodsDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.goodsService.update(id, body, identity);
  }

  @Authorize()
  @Put('active/:id')
  @ApiOperation({ summary: '是否上架该商品' })
  @ApiErrorResponse(ActiveMerchantGoodsFailedException)
  async active(
    @Param() { id }: MerchantGoodsIdDTO,
    @Body() { isActive }: MerchantGoodsActiveDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.goodsService.active(id, isActive, identity);
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除商品' })
  @ApiErrorResponse(DeleteMerchantGoodsFailedException)
  async delete(
    @Param() { id }: MerchantGoodsIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.goodsService.delete(id, identity);
  }
}
