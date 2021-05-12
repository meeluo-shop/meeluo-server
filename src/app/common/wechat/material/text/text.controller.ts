import { Authorize, Identity } from '@core/decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import { WechatMaterialTextService } from './text.service';
import { WechatMaterialTextDTO } from './text.dto';
import {
  WechatMaterialAddTextException,
  WechatMaterialGetTextException,
  WechatMaterialUpdateTextException,
  WechatMaterialDeleteTextException,
  WechatMaterialGetTextListException,
} from './text.exception';
import {
  WechatMaterialEntity,
  WechatMaterialFileTypeEnum,
} from '@typeorm/meeluoShop';
import { WechatMaterialIdDTO, WechatMaterialListDTO } from '../material.dto';
import { WechatMaterialService } from '../material.service';
import { CommonService } from '@app/common/common.service';

@ApiTags('微信图文素材相关接口')
@Controller('common/wechat/material/text')
export class WechatMaterialTextController {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatMaterialService)
    private materialService: WechatMaterialService,
    @Inject(WechatMaterialTextService)
    private textService: WechatMaterialTextService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取微信图文素材列表' })
  @ApiOkResponse({ type: [WechatMaterialEntity] })
  @ApiErrorResponse(WechatMaterialGetTextListException)
  async list(
    @Query() query: WechatMaterialListDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.materialService.list(
      WechatMaterialFileTypeEnum.TEXT,
      query,
      terminal.target,
      terminal.id,
    );
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增微信图文素材' })
  @ApiErrorResponse(WechatMaterialAddTextException)
  async create(
    @Body() body: WechatMaterialTextDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.textService.create(
      body,
      terminal.target,
      terminal.id,
      identity.userId,
    );
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改微信图文素材' })
  @ApiErrorResponse(WechatMaterialUpdateTextException)
  async update(
    @Param() { id }: WechatMaterialIdDTO,
    @Body() body: WechatMaterialTextDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.textService.update(
      id,
      body,
      identity.userId,
      terminal.target,
      terminal.id,
    );
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '查看微信图文素材' })
  @ApiErrorResponse(WechatMaterialGetTextException)
  async detail(
    @Param() { id }: WechatMaterialIdDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.materialService.detail({
      id,
      terminalId: terminal.id,
      target: terminal.target,
    });
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除微信图文素材' })
  @ApiErrorResponse(WechatMaterialDeleteTextException)
  async delete(
    @Param() { id }: WechatMaterialIdDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.materialService.delete({
      id,
      terminalId: terminal.id,
      target: terminal.target,
      userId: identity.userId,
    });
  }
}
