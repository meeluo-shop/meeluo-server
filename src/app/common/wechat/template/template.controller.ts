import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import {
  Controller,
  Inject,
  Get,
  Put,
  Post,
  Delete,
  Param,
} from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { WechatTemplateService } from './template.service';
import {
  WechatGetIndustryException,
  WechatSetIndustryException,
  WechatSetTemplateMessageException,
  WechatGetTemplateMessageException,
  WechatDelTemplateMessageException,
} from './template.exception';
import { WechatMessageTemplateEntity } from '@typeorm/meeluoShop';
import { WechatTemplateIdDTO } from './template.dto';
import { CommonService } from '../../common.service';

@ApiTags('微信模板消息相关接口')
@Controller('common/wechat/template')
export class WechatTemplateController {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatTemplateService)
    private templateService: WechatTemplateService,
  ) {}

  @Authorize()
  @Get('industry')
  @ApiOperation({ summary: '获取公众号当前行业类目' })
  @ApiErrorResponse(WechatGetIndustryException)
  async getIndustry(@Identity() identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    return this.templateService.getIndustry(terminal.target, terminal.id);
  }

  @Authorize()
  @Put('industry')
  @ApiOperation({ summary: '设置公众号行业类目为电子商务、网络游戏' })
  @ApiErrorResponse(WechatSetIndustryException)
  async setIndustry(@Identity() identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    return this.templateService.setIndustry(terminal.target, terminal.id);
  }

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取公众号模板消息列表' })
  @ApiOkResponse({ type: [WechatMessageTemplateEntity] })
  @ApiErrorResponse(WechatGetTemplateMessageException)
  async getTemplateMessage(@Identity() identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    return this.templateService.getTemplateMessage(
      terminal.target,
      terminal.id,
    );
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除公众号模板消息' })
  @ApiErrorResponse(WechatDelTemplateMessageException)
  async delTemplateMessage(
    @Param() { id }: WechatTemplateIdDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.templateService.delTemplateMessage(
      terminal.target,
      terminal.id,
      id,
      identity.userId,
    );
  }

  @Authorize()
  @Post('init')
  @ApiOperation({ summary: '初始化公众号模板消息' })
  @ApiOkResponse({ type: [WechatMessageTemplateEntity] })
  @ApiErrorResponse(WechatSetTemplateMessageException)
  async setTemplateMessage(@Identity() identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    return this.templateService.setTemplateMessage(
      terminal.target,
      terminal.id,
      identity.userId,
    );
  }
}
