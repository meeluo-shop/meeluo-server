import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiErrorResponse,
  ApiCreatedResponse,
} from '@shared/swagger';
import {
  Controller,
  Inject,
  Get,
  Post,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import {
  MerchantGoodsCategoryEntity,
  MerchantGoodsEntity,
} from '@typeorm/meeluoShop';
import { ClientGoodsService } from './goods.service';
import {
  ClientGetGoodsListException,
  ClientGetPrizeListException,
  ClientGetGoodsDetailException,
  ClientGetGoodsCategoryListException,
} from './goods.exception';
import {
  ClientGoodsIdDTO,
  ClientGoodsIdsDTO,
  ClientGoodsListDTO,
  ClientGoodsPrizeListRespDTO,
  ClientGamePrizeListParamsDTO,
} from './goods.dto';
import { MerchantGoodsCategoryListDTO } from '@app/merchant/goods';

@ApiTags('客户端商品信息相关接口')
@Controller('client/goods')
export class ClientGoodsController {
  constructor(
    @Inject(ClientGoodsService)
    private goodsService: ClientGoodsService,
  ) {}

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取商品详情' })
  @ApiErrorResponse(ClientGetGoodsDetailException)
  async detail(
    @Param() { id }: ClientGoodsIdDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.goodsService.detail(id, identity);
  }

  @Authorize()
  @Get('category/list')
  @ApiOperation({ summary: '获取商品分类列表' })
  @ApiCreatedResponse({ type: [MerchantGoodsCategoryEntity] })
  @ApiErrorResponse(ClientGetGoodsCategoryListException)
  async categoryList(
    @Query() query: MerchantGoodsCategoryListDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.goodsService.categoryList(query, identity.merchantId);
  }

  @Authorize()
  @Post('list')
  @ApiOperation({ summary: '获取商品列表' })
  @ApiCreatedResponse({ type: [MerchantGoodsEntity] })
  @ApiErrorResponse(ClientGetGoodsListException)
  async list(
    @Query() query: ClientGoodsListDTO,
    @Body() body: ClientGoodsIdsDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.goodsService.list(query, body, identity.merchantId);
  }

  @Authorize()
  @Get('prize_list')
  @ApiOperation({ summary: '获取游戏商品奖品列表' })
  @ApiOkResponse({ type: [ClientGoodsPrizeListRespDTO] })
  @ApiErrorResponse(ClientGetPrizeListException)
  async prizeList(
    @Query() params: ClientGamePrizeListParamsDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.goodsService.getPrizeList(params, identity);
  }
}
