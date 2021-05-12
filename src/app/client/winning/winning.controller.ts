import { Authorize, Identity } from '@core/decorator';
import {
  Controller,
  Inject,
  Get,
  Query,
  Param,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import { StaffGuard } from '@core/guard'
import { MerchantGameWinningEntity } from '@typeorm/meeluoShop';
import { ClientWinningRemindDeliveryParamDTO } from './winning.dto';
import {
  MerchantWinningListParamsDTO,
  MerchantWinningDetailParamsDTO,
} from '@app/merchant/winning';
import {
  ClientWinningGetListException,
  ClientWinningGetDetailException,
  ClientWinningRemindDeliveryException,
  ClientWinningConfirmReceiptException,
  ClientWinningDeliverPrizeException,
} from './winning.exception';
import { ClientWinningService } from './winning.service';

@ApiTags('客户端获奖记录相关接口')
@Controller('client/winning')
export class ClientWinningController {
  constructor(
    @Inject(ClientWinningService)
    private winningService: ClientWinningService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取获奖记录列表' })
  @ApiOkResponse({ type: [MerchantGameWinningEntity] })
  @ApiErrorResponse(ClientWinningGetListException)
  async list(
    @Query() query: MerchantWinningListParamsDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.winningService.list(query, identity);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取获奖记录详情' })
  @ApiErrorResponse(ClientWinningGetDetailException)
  async detail(
    @Param() { id }: MerchantWinningDetailParamsDTO,
    @Identity() { merchantId, userId }: ClientIdentity,
  ) {
    return this.winningService.detail(id, merchantId, userId);
  }

  @Authorize()
  @Put('confirm_receipt/:id')
  @ApiOperation({ summary: '确认奖品已收货' })
  @ApiErrorResponse(ClientWinningConfirmReceiptException)
  async confirmReceipt(
    @Param() { id }: MerchantWinningDetailParamsDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.winningService.confirmReceipt(id, identity);
  }

  @Authorize()
  @Post('remind_delivery/:id')
  @ApiOperation({ summary: '通知商家发货' })
  @ApiErrorResponse(ClientWinningRemindDeliveryException)
  async remindDelivery(
    @Param() { id }: MerchantWinningDetailParamsDTO,
    @Body() query: ClientWinningRemindDeliveryParamDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.winningService.remindDelivery(id, query, identity);
  }

  @Authorize(StaffGuard)
  @Get('staff/check_detail/:id')
  @ApiOperation({ summary: '商家核对获奖信息' })
  @ApiErrorResponse(ClientWinningGetDetailException)
  async checkDetail(
    @Param() { id }: MerchantWinningDetailParamsDTO,
    @Identity() { merchantId }: ClientIdentity,
  ) {
    return this.winningService.detail(id, merchantId);
  }

  @Authorize(StaffGuard)
  @Post('staff/deliver_prize/:id')
  @ApiOperation({ summary: '商家核销奖品' })
  @ApiErrorResponse(ClientWinningDeliverPrizeException)
  async staffConfirmReceipt(
    @Param() { id }: MerchantWinningDetailParamsDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.winningService.deliverPrize(id, identity);
  }
}
