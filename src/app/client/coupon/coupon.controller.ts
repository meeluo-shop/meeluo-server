import { Authorize, Identity } from '@core/decorator';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import { MerchantCouponGrantEntity } from '@typeorm/meeluoShop';
import { ClientCouponGrantListDTO } from './coupon.dto';
import { ClientCouponGetListException } from './coupon.exception';
import { ClientCouponService } from './coupon.service';

@ApiTags('商户后台优惠券相关接口')
@Controller('client/coupon')
export class ClientCouponController {
  constructor(
    @Inject(ClientCouponService)
    private couponService: ClientCouponService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取优惠券列表' })
  @ApiOkResponse({ type: [MerchantCouponGrantEntity] })
  @ApiErrorResponse(ClientCouponGetListException)
  async grantList(
    @Query() query: ClientCouponGrantListDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.couponService.list(query, identity);
  }
}
