import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiErrorResponse,
} from '@shared/swagger';
import { Controller, Inject, Get, Query } from '@nestjs/common';
import { MerchantGamePrizeService } from './prize.service';
import { Authorize, Identity } from '@core/decorator';
import { MerchantGamePrizeEntity } from '@typeorm/meeluoShop';
import { GetMerchantGamePrizeListException } from './prize.exception';
import { MerchantGamePrizeListParamsDTO } from './prize.dto';

@ApiTags('商户后台游戏活动奖品相关接口')
@Controller('merchant/game/prize')
export class MerchantGamePrizeController {
  constructor(
    @Inject(MerchantGamePrizeService)
    private prizeService: MerchantGamePrizeService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取商户下的奖品id列表（不包含奖品详情）' })
  @ApiOkResponse({ type: [MerchantGamePrizeEntity] })
  @ApiErrorResponse(GetMerchantGamePrizeListException)
  async getPrizeList(
    @Query() query: MerchantGamePrizeListParamsDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.prizeService.getPrizeList(query, identity.merchantId);
  }
}
