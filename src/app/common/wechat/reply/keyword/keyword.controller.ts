import { Authorize, Identity } from '@core/decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import {
  WechatKeywordDTO,
  WechatKeywordListDTO,
  WechatKeywordIdDTO,
} from './keyword.dto';
import {
  WechatAddKeywordException,
  WechatDeleteKeywordException,
  WechatGetKeywordException,
  WechatGetKeywordListException,
  WechatUpdateKeywordException,
} from './keyword.exception';
import { WechatKeywordEntity } from '@typeorm/meeluoShop';
import { WechatKeywordService } from './keyword.service';
import { CommonService } from '@app/common/common.service';

@ApiTags('微信关键字回复相关接口')
@Controller('common/wechat/reply/keyword')
export class WechatKeywordController {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatKeywordService)
    private keywordService: WechatKeywordService,
  ) {}

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增关键字回复' })
  @ApiErrorResponse(WechatAddKeywordException)
  async create(
    @Body() body: WechatKeywordDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.keywordService.create(
      body,
      identity.userId,
      terminal.target,
      terminal.id,
    );
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '查看关键字回复' })
  @ApiErrorResponse(WechatGetKeywordException)
  async detail(
    @Param() { id }: WechatKeywordIdDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.keywordService.detail(id, terminal.target, terminal.id);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改关键字回复' })
  @ApiErrorResponse(WechatUpdateKeywordException)
  async update(
    @Param() { id }: WechatKeywordIdDTO,
    @Body() body: WechatKeywordDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.keywordService.update(
      id,
      body,
      identity.userId,
      terminal.target,
      terminal.id,
    );
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除关键字回复' })
  @ApiErrorResponse(WechatDeleteKeywordException)
  async delete(
    @Param() { id }: WechatKeywordIdDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.keywordService.delete(
      id,
      identity.userId,
      terminal.target,
      terminal.id,
    );
  }

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取关键字回复列表' })
  @ApiOkResponse({ type: [WechatKeywordEntity] })
  @ApiErrorResponse(WechatGetKeywordListException)
  async list(
    @Query() query: WechatKeywordListDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.keywordService.list(query, terminal.target, terminal.id);
  }
}
