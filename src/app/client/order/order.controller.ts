import { Authorize, Identity } from '@core/decorator';
import { FastifyRequest } from 'fastify';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import {
  ClientOrderDeliveryFeeDTO,
  ClientOrderSubmitDTO,
  ClientOrderListDTO,
  ClientOrderIdDTO,
  ClientOrderPaymentDTO,
  ClientOrderPickUpGoodsDTO,
} from './order.dto';
import {
  ClientOrderPaymentException,
  ClientOrderGetListException,
  ClientOrderGetDetailException,
  ClientOrderGetDeliveryFeeException,
  ClientOrderSubmitException,
  ClientOrderCancelException,
  ClientOrderReceiptException,
  ClientOrderWechatPaymentException,
  ClientOrderPickUpGoodsException,
} from './order.exception';
import { ClientOrderService } from './order.service';
import { MerchantOrderEntity } from '@typeorm/meeluoShop';
import { StaffGuard } from '@core/guard';

@ApiTags('客户端订单相关接口')
@Controller('client/order')
export class ClientOrderController {
  constructor(
    @Inject(ClientOrderService)
    private orderService: ClientOrderService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取商品订单列表' })
  @ApiOkResponse({ type: [MerchantOrderEntity] })
  @ApiErrorResponse(ClientOrderGetListException)
  async list(
    @Query() query: ClientOrderListDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.orderService.list(query, identity);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取商品订单详情' })
  @ApiErrorResponse(ClientOrderGetDetailException)
  async detail(
    @Param() { id }: ClientOrderIdDTO,
    @Identity() { merchantId, userId }: ClientIdentity,
  ) {
    return this.orderService.detail(id, merchantId, userId);
  }

  @Authorize(StaffGuard)
  @Get('staff/check_detail/:id')
  @ApiOperation({ summary: '商家核对订单详情' })
  @ApiErrorResponse(ClientOrderGetDetailException)
  async checkDetail(
    @Param() { id }: ClientOrderIdDTO,
    @Identity() { merchantId }: ClientIdentity,
  ) {
    return this.orderService.detail(id, merchantId);
  }

  @Authorize(StaffGuard)
  @Put('staff/pick_up_goods')
  @ApiOperation({ summary: '自提订单，员工发放订单商品' })
  @ApiErrorResponse(ClientOrderPickUpGoodsException)
  async pickUpGoods(
    @Body() body: ClientOrderPickUpGoodsDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.orderService.pickUpGoods(body, identity);
  }

  @Authorize()
  @Post('delivery_fee')
  @ApiOperation({ summary: '获取订单所需的配送费用' })
  @ApiErrorResponse(ClientOrderGetDeliveryFeeException)
  async add(
    @Body() body: ClientOrderDeliveryFeeDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.orderService.deliveryFee(body, identity);
  }

  @Authorize()
  @Post('submit')
  @ApiOperation({ summary: '提交商品订单' })
  @ApiErrorResponse(ClientOrderSubmitException)
  async submit(
    @Body() body: ClientOrderSubmitDTO,
    @Identity() identity: ClientIdentity,
    @Req() request: FastifyRequest,
  ) {
    return this.orderService.submit(body, identity, request);
  }

  @Authorize()
  @Put('cancel/:id')
  @ApiOperation({ summary: '取消订单' })
  @ApiErrorResponse(ClientOrderCancelException)
  async cancel(
    @Param() { id }: ClientOrderIdDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.orderService.cancel(id, identity);
  }

  @Authorize()
  @Put('receipt/:id')
  @ApiOperation({ summary: '订单确认收货' })
  @ApiErrorResponse(ClientOrderReceiptException)
  async receipt(
    @Param() { id }: ClientOrderIdDTO,
    @Identity() { userId, merchantId }: ClientIdentity,
  ) {
    return this.orderService.receipt(id, userId, merchantId);
  }

  @Authorize()
  @Post('payment/:id')
  @ApiOperation({ summary: '支付订单接口' })
  @ApiErrorResponse(ClientOrderPaymentException)
  async payment(
    @Param() { id }: ClientOrderIdDTO,
    @Body() { payType }: ClientOrderPaymentDTO,
    @Identity() identity: ClientIdentity,
    @Req() request: FastifyRequest,
  ) {
    return this.orderService.payment(id, payType, identity, request);
  }

  @Authorize()
  @Get('wechat_pay/success')
  @ApiOperation({ summary: '微信支付订单成功回执' })
  @ApiErrorResponse(ClientOrderWechatPaymentException)
  async wechatPaySuccess(@Identity() identity: ClientIdentity) {
    return this.orderService.wechatPaySuccess(identity);
  }
}
