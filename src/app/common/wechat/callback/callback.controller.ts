import { FastifyReply } from 'fastify';
import {
  Inject,
  Controller,
  Post,
  Body,
  Response,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@shared/swagger';
import { WechatCallbackService } from './callback.service';
import {
  WechatCallbackParamDTO,
  WechatPaymentCallbackDTO,
  WechatNotifyCallbackDTO,
  WechatNotifyCheckSignDTO,
} from './callback.dto';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';

@ApiTags('微信回调通知相关接口')
@Controller('common/wechat/callback')
export class WechatCallbackController {
  constructor(
    @InjectLogger(WechatCallbackController)
    private logger: LoggerProvider,
    @Inject(WechatCallbackService)
    private callbackService: WechatCallbackService,
  ) {}

  @Get('notify/:type/:id')
  @ApiOperation({ summary: '微信校验通知回调地址签名token' })
  async checkNotifyToken(
    @Param() param: WechatCallbackParamDTO,
    @Query() query: WechatNotifyCheckSignDTO,
    @Response() response: FastifyReply,
  ) {
    const isVerify = await this.callbackService.validateSign(param, query);
    response.send(isVerify);
  }

  @Post('notify/:type/:id')
  @ApiBody({ type: WechatNotifyCallbackDTO })
  @ApiOperation({ summary: '处理微信消息通知' })
  async notify(
    @Param() param: WechatCallbackParamDTO,
    @Query() query: WechatNotifyCheckSignDTO,
    @Body('xml') body: WechatNotifyCallbackDTO,
    @Response() response: FastifyReply,
  ) {
    await this.callbackService.replyMessage({
      response,
      param,
      notifyData: body,
      signData: query,
    });
  }

  @Post('payment')
  @ApiBody({ type: WechatPaymentCallbackDTO })
  @ApiOperation({ summary: '处理微信支付结果回调' })
  async payment(
    @Body('xml') body: WechatPaymentCallbackDTO,
    @Response() response: FastifyReply,
  ) {
    try {
      this.callbackService.renderPaymentXML(response, {
        returnCode: 'SUCCESS',
        returnMsg: 'OK',
      });
    } catch (err) {
      this.logger.error(
        `处理微信支付订单[${body.outTradeNo}]回调失败[${err.message}]`,
      );
      this.callbackService.renderPaymentXML(response, {
        returnCode: 'FAIL',
        returnMsg: err.message,
      });
    }
  }
}
