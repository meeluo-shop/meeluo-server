import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiErrorResponse, ApiOperation, ApiTags } from '@shared/swagger';
import { ClientUserService } from './user.service';
import {
  ClientUserGetDetailException,
  ClientUserGetOrderCountException,
  ClientUserGetScanTableException,
  ClientUserSubtractBalanceException,
  ClientUserSendPhoneCodeException,
  ClientUserVerifyPhoneCodeException,
} from './user.exception';
import {
  ClientUserSubtractBalanceDTO,
  ClientUserIdDTO,
  ClientUserSendPhoneCodeDTO,
  ClientUserVerifyPhoneCodeDTO,
} from './user.dto';
import { Authorize, Identity } from '@core/decorator';
import { StaffGuard } from '@core/guard';
import { SMSService } from '@app/common/sms';

@ApiTags('客户端用户相关接口')
@Controller('client/user')
export class ClientUserController {
  constructor(
    @Inject(SMSService)
    private smsService: SMSService,
    @Inject(ClientUserService)
    private userService: ClientUserService,
  ) {}

  @Get('baseinfo/:id')
  @ApiOperation({ summary: '无需授权可获得的用户基础信息' })
  @ApiErrorResponse(ClientUserGetDetailException)
  async baseinfo(@Param() { id }: ClientUserIdDTO) {
    return this.userService.getUserBaseInfo(id);
  }

  @Authorize()
  @Get('userinfo')
  @ApiOperation({ summary: '获取用户详细信息' })
  @ApiErrorResponse(ClientUserGetDetailException)
  async userinfo(@Identity() { merchantId, userId }: ClientIdentity) {
    return this.userService.getUserInfo(userId, merchantId);
  }

  @Authorize()
  @Get('order_count')
  @ApiOperation({ summary: '获取用户订单和获奖记录数量' })
  @ApiErrorResponse(ClientUserGetOrderCountException)
  async orderCount(@Identity() { merchantId, userId }: ClientIdentity) {
    return this.userService.getUserOrderCount(userId, merchantId);
  }

  @Authorize()
  @Post('phone/send_code')
  @ApiOperation({ summary: '用户发送短信验证码' })
  @ApiErrorResponse(ClientUserSendPhoneCodeException)
  async sendPhoneCode(
    @Body() { phone }: ClientUserSendPhoneCodeDTO,
    @Identity() { userId }: ClientIdentity,
  ) {
    await this.smsService.sendSMSCode(userId, phone);
    return true;
  }

  @Authorize()
  @Put('phone/bind')
  @ApiOperation({ summary: '用户绑定手机号' })
  @ApiErrorResponse(ClientUserVerifyPhoneCodeException)
  async bindPhone(
    @Body() { code, phone }: ClientUserVerifyPhoneCodeDTO,
    @Identity() { userId, merchantId }: ClientIdentity,
  ) {
    return this.userService.bindPhone({ code, phone, userId, merchantId });
  }

  @Authorize()
  @Get('scan_table')
  @ApiOperation({ summary: '获取用户餐桌扫码后得到的餐桌信息' })
  @ApiErrorResponse(ClientUserGetScanTableException)
  async scanTable(@Identity() identity: ClientIdentity) {
    return this.userService.getScanTable(identity);
  }

  @Authorize(StaffGuard)
  @Put('staff/balance/subtract')
  @ApiOperation({ summary: '扣除用户余额' })
  @ApiErrorResponse(ClientUserSubtractBalanceException)
  async staffPrintOrder(
    @Body() data: ClientUserSubtractBalanceDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.userService.subtractBalance(data, identity);
  }
}
