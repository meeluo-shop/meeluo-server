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
  ClientMenuOrderSubmitDTO,
  ClientMenuOrderListDTO,
  ClientMenuOrderIdDTO,
  ClientMenuOrderPaymentDTO,
} from './menu.dto';
import {
  ClientMenuOrderAgreeCancelException,
  ClientMenuOrderRefuseCancelException,
  ClientMenuOrderCompleteException,
  ClientMenuOrderServingException,
  ClientMenuOrderPaymentException,
  ClientMenuOrderGetListException,
  ClientMenuOrderGetDetailException,
  ClientMenuOrderSubmitException,
  ClientMenuOrderCancelException,
  ClientMenuGetPayTypeSettingException,
  ClientMenuOrderWechatPaymentException,
  ClientMenuOrderPrintException,
  ClientMenuOrderSetPaidException,
} from './menu.exception';
import { MerchantMenuSettingService } from '@app/merchant/menu/setting';
import { ClientMenuService } from './menu.service';
import { MerchantMenuOrderEntity } from '@typeorm/meeluoShop';
import {
  MerchantMenuOrderService,
  MerchantMenuOrderServingDTO,
} from '@app/merchant/menu/order';
import { StaffGuard } from '@core/guard';

@ApiTags('客户端点餐相关接口')
@Controller('client/menu')
export class ClientMenuController {
  constructor(
    @Inject(ClientMenuService)
    private menuService: ClientMenuService,
    @Inject(MerchantMenuOrderService)
    private merchantMenuOrderService: MerchantMenuOrderService,
    @Inject(MerchantMenuSettingService)
    private menuSettingService: MerchantMenuSettingService,
  ) {}

  @Authorize()
  @Get('order/list')
  @ApiOperation({ summary: '获取点餐订单列表' })
  @ApiOkResponse({ type: [MerchantMenuOrderEntity] })
  @ApiErrorResponse(ClientMenuOrderGetListException)
  async list(
    @Query() query: ClientMenuOrderListDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.menuService.list(query, identity);
  }

  @Authorize()
  @Get('order/detail/:id')
  @ApiOperation({ summary: '获取点餐订单详情' })
  @ApiErrorResponse(ClientMenuOrderGetDetailException)
  async detail(
    @Param() { id }: ClientMenuOrderIdDTO,
    @Identity() { merchantId, userId }: ClientIdentity,
  ) {
    return this.menuService.detail(id, merchantId, userId);
  }

  @Authorize()
  @Post('order/submit')
  @ApiOperation({ summary: '提交点餐订单' })
  @ApiErrorResponse(ClientMenuOrderSubmitException)
  async submit(
    @Body() body: ClientMenuOrderSubmitDTO,
    @Identity() identity: ClientIdentity,
    @Req() request: FastifyRequest,
  ) {
    return this.menuService.submit(body, identity, request);
  }

  @Authorize()
  @Put('order/cancel/:id')
  @ApiOperation({ summary: '取消订单' })
  @ApiErrorResponse(ClientMenuOrderCancelException)
  async cancel(
    @Param() { id }: ClientMenuOrderIdDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.menuService.cancel(id, identity);
  }

  @Authorize()
  @Post('order/payment/:id')
  @ApiOperation({ summary: '支付订单接口' })
  @ApiErrorResponse(ClientMenuOrderPaymentException)
  async payment(
    @Param() { id }: ClientMenuOrderIdDTO,
    @Body() { payType }: ClientMenuOrderPaymentDTO,
    @Identity() identity: ClientIdentity,
    @Req() request: FastifyRequest,
  ) {
    return this.menuService.payment(id, payType, identity, request);
  }

  @Authorize()
  @Get('order/wechat_pay/success')
  @ApiOperation({ summary: '微信支付订单成功回执' })
  @ApiErrorResponse(ClientMenuOrderWechatPaymentException)
  async wechatPaySuccess(@Identity() identity: ClientIdentity) {
    return this.menuService.wechatPaySuccess(identity);
  }

  @Authorize()
  @Get('setting/pay_type')
  @ApiOperation({ summary: '获取点餐支付方式类型列表' })
  @ApiErrorResponse(ClientMenuGetPayTypeSettingException)
  async getPointsSetting(@Identity() identity: ClientIdentity) {
    return this.menuSettingService.getPayTypeSetting(identity.merchantId);
  }

  @Authorize(StaffGuard)
  @Get('staff/order/list')
  @ApiOperation({ summary: '员工获取商家所有点餐订单列表' })
  @ApiOkResponse({ type: [MerchantMenuOrderEntity] })
  @ApiErrorResponse(ClientMenuOrderGetListException)
  async merchantOrderList(
    @Query() query: ClientMenuOrderListDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.merchantMenuOrderService.list(query, identity.merchantId);
  }

  @Authorize(StaffGuard)
  @Get('staff/order/detail/:id')
  @ApiOperation({ summary: '员工获取商家点餐订单详情' })
  @ApiErrorResponse(ClientMenuOrderGetDetailException)
  async merchantOrderDetail(
    @Param() { id }: ClientMenuOrderIdDTO,
    @Identity() { merchantId }: ClientIdentity,
  ) {
    return this.menuService.detail(id, merchantId);
  }

  @Authorize(StaffGuard)
  @Put('staff/order/serving')
  @ApiOperation({ summary: '员工设置订单状态为已上餐' })
  @ApiErrorResponse(ClientMenuOrderServingException)
  async staffOrderServing(
    @Body() body: MerchantMenuOrderServingDTO,
    @Identity() { staffId, merchantId }: ClientIdentity,
  ) {
    return this.merchantMenuOrderService.serving(body, staffId, merchantId);
  }

  @Authorize(StaffGuard)
  @Put('staff/order/complete/:id')
  @ApiOperation({ summary: '员工设置订单状态为已完成' })
  @ApiErrorResponse(ClientMenuOrderCompleteException)
  async staffOrderComplete(
    @Param() { id }: ClientMenuOrderIdDTO,
    @Identity() { staffId, merchantId }: ClientIdentity,
  ) {
    return this.merchantMenuOrderService.complete(id, staffId, merchantId);
  }

  @Authorize(StaffGuard)
  @Put('staff/order/agree_cancel/:id')
  @ApiOperation({ summary: '员工同意用户取消已付款订单' })
  @ApiErrorResponse(ClientMenuOrderAgreeCancelException)
  async staffAgreeCancelOrder(
    @Param() { id }: ClientMenuOrderIdDTO,
    @Identity() { staffId, merchantId }: ClientIdentity,
  ) {
    return this.merchantMenuOrderService.agreeCancelOrder(
      id,
      staffId,
      merchantId,
    );
  }

  @Authorize(StaffGuard)
  @Put('staff/order/refuse_cancel/:id')
  @ApiOperation({ summary: '员工拒绝用户取消已付款订单' })
  @ApiErrorResponse(ClientMenuOrderRefuseCancelException)
  async staffRefuseCancelOrder(
    @Param() { id }: ClientMenuOrderIdDTO,
    @Identity() { staffId, merchantId }: ClientIdentity,
  ) {
    return this.merchantMenuOrderService.refuseCancelOrder(
      id,
      staffId,
      merchantId,
    );
  }

  @Authorize(StaffGuard)
  @Post('staff/order/print/:id')
  @ApiOperation({ summary: '员工打印订单小票' })
  @ApiErrorResponse(ClientMenuOrderPrintException)
  async staffPrintOrder(
    @Param() { id }: ClientMenuOrderIdDTO,
    @Identity() { merchantId }: ClientIdentity,
  ) {
    return this.merchantMenuOrderService.printOrder(id, merchantId);
  }

  @Authorize(StaffGuard)
  @Put('staff/order/paid/:id')
  @ApiOperation({ summary: '员工设置订单状态为已付款' })
  @ApiErrorResponse(ClientMenuOrderSetPaidException)
  async staffSetPaid(
    @Param() { id }: ClientMenuOrderIdDTO,
    @Identity() { merchantId, staffId }: ClientIdentity,
  ) {
    return this.merchantMenuOrderService.setPaid({
      orderId: id,
      staffId,
      merchantId,
    });
  }
}
