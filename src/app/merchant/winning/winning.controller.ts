import { Authorize, Identity } from '@core/decorator';
import {
  Controller,
  Inject,
  Get,
  Query,
  Param,
  Put,
  Body,
} from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import { MerchantGameWinningEntity } from '@typeorm/meeluoShop';
import {
  MerchantWinningListParamsDTO,
  MerchantWinningDetailParamsDTO,
  MerchantWinningDeliverPrizeDTO,
} from './winning.dto';
import {
  MerchantWinningGetListException,
  MerchantWinningGetDetailException,
  MerchantWinningDeliverPrizeException,
} from './winning.exception';
import { MerchantWinningService } from './winning.service';

@ApiTags('商户获奖记录相关接口')
@Controller('merchant/winning')
export class MerchantWinningController {
  constructor(
    @Inject(MerchantWinningService)
    private winningService: MerchantWinningService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取获奖记录列表' })
  @ApiOkResponse({ type: [MerchantGameWinningEntity] })
  @ApiErrorResponse(MerchantWinningGetListException)
  async list(
    @Query() query: MerchantWinningListParamsDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    return this.winningService.list(query, merchantId);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取获奖记录详情' })
  @ApiErrorResponse(MerchantWinningGetDetailException)
  async detail(
    @Param() { id }: MerchantWinningDetailParamsDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    return this.winningService.detail(id, merchantId);
  }

  @Authorize()
  @Put('deliver_prize')
  @ApiOperation({ summary: '获奖订单商品发货' })
  @ApiErrorResponse(MerchantWinningDeliverPrizeException)
  async deliverGoods(
    @Body() body: MerchantWinningDeliverPrizeDTO,
    @Identity() { userId, merchantId }: MerchantIdentity,
  ) {
    return this.winningService.deliverPrize(body, userId, merchantId);
  }
}
