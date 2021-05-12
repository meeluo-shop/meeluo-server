import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Inject, Get, Put, Body } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { WechatReplySubscribeService } from './subscribe.service';
import {
  WechatGetReplySubscribeException,
  WechatModifyReplySubscribeException,
} from './subscribe.exception';
import { WechatReplySubscribeDTO } from './subscribe.dto';
import { CommonService } from '@app/common/common.service';

@ApiTags('微信关注回复相关接口')
@Controller('common/wechat/reply/subscribe')
export class WechatReplySubscribeController {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatReplySubscribeService)
    private subscribeService: WechatReplySubscribeService,
  ) {}

  @Authorize()
  @Get()
  @ApiOperation({ summary: '获取微信关注回复' })
  @ApiErrorResponse(WechatGetReplySubscribeException)
  async getSubscribeReply(@Identity() identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    return this.subscribeService.getSubscribeReply(
      terminal.target,
      terminal.id,
    );
  }

  @Authorize()
  @Put()
  @ApiOperation({ summary: '更新微信关注回复' })
  @ApiErrorResponse(WechatModifyReplySubscribeException)
  async setSubscribeReply(
    @Body() body: WechatReplySubscribeDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.subscribeService.setSubscribeReply(
      body,
      identity.userId,
      terminal.target,
      terminal.id,
    );
  }
}
