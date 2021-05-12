import { Authorize, Identity } from '@core/decorator';
import { FastifyRequest } from 'fastify';
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import { ClientRechargeService } from './recharge.service';
import {
  ClientRechargePlanListException,
  ClientRechargeGetBalanceLogException,
  ClientRechargeGetSettingException,
  ClientRechargeUnifyWechatPayException,
  ClientRechargeWechatPaySuccessException,
} from './recharge.exception';
import {
  ClientRechargeParamsDTO,
  ClientRechargeBalanceLogListDTO,
  ClientRechargeWechatPaySignData,
} from './recharge.dto';
import {
  MerchantRechargePlanEntity,
  MerchantUserBalanceLogEntity,
} from '@typeorm/meeluoShop';

@ApiTags('客户端充值相关接口')
@Controller('client/recharge')
export class ClientRechargeController {
  constructor(
    @Inject(ClientRechargeService)
    private rechargeService: ClientRechargeService,
  ) {}

  @Authorize()
  @Get('plan/list')
  @ApiOperation({ summary: '获取充值套餐列表' })
  @ApiOkResponse({ type: [MerchantRechargePlanEntity] })
  @ApiErrorResponse(ClientRechargePlanListException)
  async list(@Identity() identity: ClientIdentity) {
    return this.rechargeService.getPlanList(identity);
  }

  @Authorize()
  @Get('setting')
  @ApiOperation({ summary: '获取充值设置' })
  @ApiErrorResponse(ClientRechargeGetSettingException)
  async getSetting(@Identity() identity: ClientIdentity) {
    return this.rechargeService.getRechargeSetting(identity);
  }

  @Authorize()
  @Get('balance_log')
  @ApiOperation({ summary: '获取用户余额明细' })
  @ApiOkResponse({ type: [MerchantUserBalanceLogEntity] })
  @ApiErrorResponse(ClientRechargeGetBalanceLogException)
  async getBalanceLog(
    @Query() query: ClientRechargeBalanceLogListDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.rechargeService.getBalanceLog(query, identity);
  }

  @Authorize()
  @Post('wechat_pay')
  @ApiOperation({ summary: '发起微信支付充值' })
  @ApiOkResponse({ type: ClientRechargeWechatPaySignData })
  @ApiErrorResponse(ClientRechargeUnifyWechatPayException)
  async wechatPay(
    @Body() body: ClientRechargeParamsDTO,
    @Identity() identity: ClientIdentity,
    @Request() request: FastifyRequest,
  ) {
    return this.rechargeService.wechatPay(body, identity, request);
  }

  @Authorize()
  @Get('wechat_pay/success')
  @ApiOperation({ summary: '微信充值订单成功回执' })
  @ApiErrorResponse(ClientRechargeWechatPaySuccessException)
  async wechatPaySuccess(@Identity() identity: ClientIdentity) {
    return this.rechargeService.wechatPaySuccess(identity);
  }
}
