import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Inject, Get, Put, Body } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { WechatReplyScanCodeService } from './scancode.service';
import {
  WechatGetReplyScanCodeException,
  WechatModifyReplyScanCodeException,
} from './scancode.exception';
import { WechatReplyScanCodeDTO } from './scancode.dto';
import { CommonService } from '@app/common/common.service';

@ApiTags('微信扫码回复相关接口')
@Controller('common/wechat/reply/scancode')
export class WechatReplyScanCodeController {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatReplyScanCodeService)
    private scanCodeService: WechatReplyScanCodeService,
  ) {}

  @Authorize()
  @Get()
  @ApiOperation({ summary: '获取微信扫码回复' })
  @ApiErrorResponse(WechatGetReplyScanCodeException)
  async getScanCodeReply(@Identity() identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    return this.scanCodeService.getScanCodeReply(terminal.target, terminal.id);
  }

  @Authorize()
  @Put()
  @ApiOperation({ summary: '更新微信扫码回复' })
  @ApiErrorResponse(WechatModifyReplyScanCodeException)
  async setScanCodeReply(
    @Body() body: WechatReplyScanCodeDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.scanCodeService.setScanCodeReply(
      body,
      identity.userId,
      terminal.target,
      terminal.id,
    );
  }
}
