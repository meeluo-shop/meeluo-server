import { Authorize, Identity } from '@core/decorator';
import { Body, Controller, Get, Inject, Put, Query } from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import { MerchantUserBalanceLogEntity } from '@typeorm/meeluoShop';
import {
  MerchantUserBalanceListDTO,
  MerchantUserBalanceModifyDTO,
} from './balance.dto';
import {
  MerchantUserBalanceLogListException,
  MerchantUserBalanceModifyException,
} from './balance.exception';
import { MerchantUserBalanceService } from './balance.service';

@ApiTags('商户后台用户余额相关接口')
@Controller('merchant/user/balance')
export class MerchantUserBalanceController {
  constructor(
    @Inject(MerchantUserBalanceService)
    private balanceService: MerchantUserBalanceService,
  ) {}

  @Authorize()
  @Get('log')
  @ApiOperation({ summary: '获取用户余额明细列表' })
  @ApiOkResponse({ type: [MerchantUserBalanceLogEntity] })
  @ApiErrorResponse(MerchantUserBalanceLogListException)
  async log(
    @Query() query: MerchantUserBalanceListDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    return this.balanceService.log(query, merchantId);
  }

  @Authorize()
  @Put('modify')
  @ApiOperation({ summary: '修改用户余额' })
  @ApiErrorResponse(MerchantUserBalanceModifyException)
  async modify(
    @Body() body: MerchantUserBalanceModifyDTO,
    @Identity() { merchantId, user }: MerchantIdentity,
  ) {
    return this.balanceService.modifyBalance(body, merchantId, user.nickname);
  }
}
