import { Authorize, Identity } from '@core/decorator';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import { MerchantOrderEntity } from '@typeorm/meeluoShop';
import {
  MerchantOrderListDTO,
  MerchantOrderUpdatePriceDTO,
  MerchantOrderIdDTO,
  MerchantOrderPickUpGoodsDTO,
  MerchantOrderDeliverGoodsDTO,
} from './order.dto';
import {
  MerchantOrderGetListException,
  MerchantOrderGetDetailException,
  MerchantOrderGetExpressListException,
  MerchantOrderPickUpGoodsException,
  MerchantOrderDeliverGoodsException,
  MerchantOrderUpdateException,
  MerchantOrderAgreeCancelException,
  MerchantOrderRefuseCancelException,
} from './order.exception';
import { MerchantOrderService } from './order.service';

@ApiTags('商户后台订单相关接口')
@Controller('merchant/order')
export class MerchantOrderController {
  constructor(
    @Inject(MerchantOrderService)
    private orderService: MerchantOrderService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取商品订单列表' })
  @ApiOkResponse({ type: [MerchantOrderEntity] })
  @ApiErrorResponse(MerchantOrderGetListException)
  async list(
    @Query() query: MerchantOrderListDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    return this.orderService.list(query, merchantId, true);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取商品订单详情' })
  @ApiErrorResponse(MerchantOrderGetDetailException)
  async detail(
    @Param() { id }: MerchantOrderIdDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    return this.orderService.detail(id, merchantId);
  }

  @Authorize()
  @Put('pick_up_goods')
  @ApiOperation({ summary: '自提订单，员工发放订单商品' })
  @ApiErrorResponse(MerchantOrderPickUpGoodsException)
  async pickUpGoods(
    @Body() body: MerchantOrderPickUpGoodsDTO,
    @Identity() { userId, merchantId }: MerchantIdentity,
  ) {
    return this.orderService.pickUpGoods(body, userId, merchantId);
  }

  @Authorize()
  @Put('deliver_goods')
  @ApiOperation({ summary: '订单商品发货' })
  @ApiErrorResponse(MerchantOrderDeliverGoodsException)
  async deliverGoods(
    @Body() body: MerchantOrderDeliverGoodsDTO,
    @Identity() { userId, merchantId }: MerchantIdentity,
  ) {
    return this.orderService.deliverGoods(body, userId, merchantId);
  }

  @Authorize()
  @Put('update_price/:id')
  @ApiOperation({ summary: '后台修改订单价格' })
  @ApiErrorResponse(MerchantOrderUpdateException)
  async updatePrice(
    @Param() { id }: MerchantOrderIdDTO,
    @Body() body: MerchantOrderUpdatePriceDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.orderService.updatePrice(id, body, identity);
  }

  @Authorize()
  @Put('agree_cancel/:id')
  @ApiOperation({ summary: '同意用户取消已付款订单' })
  @ApiErrorResponse(MerchantOrderAgreeCancelException)
  async agreeCancelOrder(
    @Param() { id }: MerchantOrderIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.orderService.agreeCancelOrder(id, identity);
  }

  @Authorize()
  @Put('refuse_cancel/:id')
  @ApiOperation({ summary: '拒绝用户取消已付款订单' })
  @ApiErrorResponse(MerchantOrderRefuseCancelException)
  async refuseCancelOrder(
    @Param() { id }: MerchantOrderIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.orderService.refuseCancelOrder(id, identity);
  }

  @Authorize()
  @Get('express/list')
  @ApiOperation({ summary: '获取所有物流公司列表' })
  @ApiErrorResponse(MerchantOrderGetExpressListException)
  async expressList() {
    return this.orderService.expressList();
  }
}
