import {
  Controller,
  Inject,
  Post,
  Body,
  Param,
  Get,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import { MerchantCouponService } from './coupon.service';
import { Authorize, Identity } from '@core/decorator';
import {
  MerchantCouponDTO,
  MerchantCouponIdDTO,
  MerchantCouponListDTO,
  MerchantCouponGrantUserDTO,
  MerchantCouponGrantListDTO,
} from './coupon.dto';
import {
  CreateMerchantCouponFailedException,
  UpdateMerchantCouponFailedException,
  DeleteMerchantCouponFailedException,
  GetMerchantCouponDetailFailedException,
  GetMerchantCouponListFailedException,
  MerchantCouponGrantFailedException,
} from './coupon.exception';
import {
  MerchantCouponEntity,
  MerchantCouponGrantEntity,
} from '@typeorm/meeluoShop';

@ApiTags('商户后台优惠券相关接口')
@Controller('merchant/coupon')
export class MerchantCouponController {
  constructor(
    @Inject(MerchantCouponService)
    private couponService: MerchantCouponService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取优惠券列表' })
  @ApiOkResponse({ type: [MerchantCouponEntity] })
  @ApiErrorResponse(GetMerchantCouponListFailedException)
  async list(
    @Query() query: MerchantCouponListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.couponService.list(query, identity);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取优惠券详情' })
  @ApiErrorResponse(GetMerchantCouponDetailFailedException)
  async detail(
    @Param() { id }: MerchantCouponIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.couponService.detail(id, identity.merchantId);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增优惠券' })
  @ApiErrorResponse(CreateMerchantCouponFailedException)
  async create(
    @Body() body: MerchantCouponDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.couponService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改优惠券' })
  @ApiErrorResponse(UpdateMerchantCouponFailedException)
  async update(
    @Param() { id }: MerchantCouponIdDTO,
    @Body() body: MerchantCouponDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.couponService.update(id, body, identity);
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除优惠券' })
  @ApiErrorResponse(DeleteMerchantCouponFailedException)
  async delete(
    @Param() { id }: MerchantCouponIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.couponService.delete(id, identity);
  }

  @Authorize()
  @Post('grant')
  @ApiOperation({ summary: '发放优惠券' })
  @ApiOkResponse({ type: [MerchantCouponGrantEntity] })
  @ApiErrorResponse(MerchantCouponGrantFailedException)
  async grant(
    @Body() body: MerchantCouponGrantUserDTO,
    @Identity() { merchantId, userId }: MerchantIdentity,
  ) {
    return this.couponService.grantTransaction({
      ...body,
      merchantId,
      staffId: userId,
    });
  }

  @Authorize()
  @Get('grant/list')
  @ApiOperation({ summary: '获取优惠券领取列表' })
  @ApiOkResponse({ type: [MerchantCouponGrantEntity] })
  @ApiErrorResponse(GetMerchantCouponListFailedException)
  async grantList(
    @Query() query: MerchantCouponGrantListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.couponService.grantList(query, identity.merchantId);
  }
}
