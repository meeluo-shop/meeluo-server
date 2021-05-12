import { Authorize, Identity } from '@core/decorator';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import { MerchantMenuOrderEntity } from '@typeorm/meeluoShop';
import {
  MerchantMenuOrderListDTO,
  MerchantMenuOrderUpdatePriceDTO,
  MerchantMenuOrderIdDTO,
  MerchantMenuOrderServingDTO,
  MerchantMenuOrderSubmitDTO,
} from './order.dto';
import {
  MerchantMenuOrderGetListException,
  MerchantMenuOrderGetDetailException,
  MerchantMenuOrderServingException,
  MerchantMenuOrderUpdateException,
  MerchantMenuOrderAgreeCancelException,
  MerchantMenuOrderRefuseCancelException,
  MerchantMenuOrderCompleteException,
  MerchantMenuOrderPrintException,
  MerchantMenuOrderSetPaidException,
  MerchantMenuOrderSubmitException,
} from './order.exception';
import { MerchantMenuOrderService } from './order.service';

@ApiTags('商户后台点餐订单相关接口')
@Controller('merchant/menu/order')
export class MerchantMenuOrderController {
  constructor(
    @Inject(MerchantMenuOrderService)
    private orderService: MerchantMenuOrderService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取点餐订单列表' })
  @ApiOkResponse({ type: [MerchantMenuOrderEntity] })
  @ApiErrorResponse(MerchantMenuOrderGetListException)
  async list(
    @Query() query: MerchantMenuOrderListDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    return this.orderService.list(query, merchantId, true);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取点餐订单详情' })
  @ApiErrorResponse(MerchantMenuOrderGetDetailException)
  async detail(
    @Param() { id }: MerchantMenuOrderIdDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    return this.orderService.detail(id, merchantId);
  }

  @Authorize()
  @Post('submit')
  @ApiOperation({ summary: ' 前台提交点餐订单' })
  @ApiErrorResponse(MerchantMenuOrderSubmitException)
  async submit(
    @Body() body: MerchantMenuOrderSubmitDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.orderService.submit(body, identity);
  }

  @Authorize()
  @Put('serving')
  @ApiOperation({ summary: '设置订单状态为已上餐' })
  @ApiErrorResponse(MerchantMenuOrderServingException)
  async serving(
    @Body() body: MerchantMenuOrderServingDTO,
    @Identity() { userId, merchantId }: MerchantIdentity,
  ) {
    return this.orderService.serving(body, userId, merchantId);
  }

  @Authorize()
  @Put('complete/:id')
  @ApiOperation({ summary: '设置订单状态为已完成' })
  @ApiErrorResponse(MerchantMenuOrderCompleteException)
  async complete(
    @Param() { id }: MerchantMenuOrderIdDTO,
    @Identity() { userId, merchantId }: MerchantIdentity,
  ) {
    return this.orderService.complete(id, userId, merchantId);
  }

  @Authorize()
  @Put('paid/:id')
  @ApiOperation({ summary: '设置线下支付订单状态为已支付' })
  @ApiErrorResponse(MerchantMenuOrderSetPaidException)
  async setPaid(
    @Param() { id }: MerchantMenuOrderIdDTO,
    @Identity() { userId, merchantId }: MerchantIdentity,
  ) {
    return this.orderService.setPaid({
      orderId: id,
      staffId: userId,
      merchantId,
    });
  }

  @Authorize()
  @Put('update_price/:id')
  @ApiOperation({ summary: '后台修改订单价格' })
  @ApiErrorResponse(MerchantMenuOrderUpdateException)
  async updatePrice(
    @Param() { id }: MerchantMenuOrderIdDTO,
    @Body() body: MerchantMenuOrderUpdatePriceDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.orderService.updatePrice(id, body, identity);
  }

  @Authorize()
  @Put('agree_cancel/:id')
  @ApiOperation({ summary: '同意用户取消已付款订单' })
  @ApiErrorResponse(MerchantMenuOrderAgreeCancelException)
  async agreeCancelOrder(
    @Param() { id }: MerchantMenuOrderIdDTO,
    @Identity() { userId, merchantId }: MerchantIdentity,
  ) {
    return this.orderService.agreeCancelOrder(id, userId, merchantId);
  }

  @Authorize()
  @Put('refuse_cancel/:id')
  @ApiOperation({ summary: '拒绝用户取消已付款订单' })
  @ApiErrorResponse(MerchantMenuOrderRefuseCancelException)
  async refuseCancelOrder(
    @Param() { id }: MerchantMenuOrderIdDTO,
    @Identity() { userId, merchantId }: MerchantIdentity,
  ) {
    return this.orderService.refuseCancelOrder(id, userId, merchantId);
  }

  @Authorize()
  @Post('print/:id')
  @ApiOperation({ summary: '打印订单小票' })
  @ApiErrorResponse(MerchantMenuOrderPrintException)
  async printOrder(
    @Param() { id }: MerchantMenuOrderIdDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    return this.orderService.printOrder(id, merchantId);
  }
}
