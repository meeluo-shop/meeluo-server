import { Authorize, Identity } from '@core/decorator';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import { MerchantUserPointsLogEntity } from '@typeorm/meeluoShop';
import { MerchantPointsListDTO } from './points.dto';
import { MerchantPointsLogListException } from './points.exception';
import { MerchantPointsService } from './points.service';

@ApiTags('商户后台用户积分相关接口')
@Controller('merchant/points')
export class MerchantPointsController {
  constructor(
    @Inject(MerchantPointsService)
    private pointsService: MerchantPointsService,
  ) {}

  @Authorize()
  @Get('log')
  @ApiOperation({ summary: '获取用户积分明细列表' })
  @ApiOkResponse({ type: [MerchantUserPointsLogEntity] })
  @ApiErrorResponse(MerchantPointsLogListException)
  async log(
    @Query() query: MerchantPointsListDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    return this.pointsService.log(query, merchantId);
  }
}
