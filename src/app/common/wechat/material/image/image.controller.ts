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
import { WechatMaterialImageService } from './image.service';
import { WechatMaterialListDTO, WechatMaterialIdDTO } from '../material.dto';
import { WechatMaterialImageDTO } from './image.dto';
import {
  WechatMaterialAddImageException,
  WechatMaterialGetImageException,
  WechatMaterialUpdateImageException,
  WechatMaterialDeleteImageException,
  WechatMaterialGetImageListException,
} from './image.exception';
import {
  WechatMaterialEntity,
  WechatMaterialFileTypeEnum,
} from '@typeorm/meeluoShop';
import { WechatMaterialService } from '../material.service';
import { CommonService } from '@app/common/common.service';

@ApiTags('微信图片素材相关接口')
@Controller('common/wechat/material/image')
export class WechatMaterialImageController {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatMaterialService)
    private materialService: WechatMaterialService,
    @Inject(WechatMaterialImageService)
    private imageService: WechatMaterialImageService,
  ) {}

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增微信图片素材' })
  @ApiErrorResponse(WechatMaterialAddImageException)
  async create(
    @Body() body: WechatMaterialImageDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.imageService.create({
      ...terminal,
      body,
      userId: identity.userId,
    });
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '查看微信图片素材' })
  @ApiErrorResponse(WechatMaterialGetImageException)
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
  @Put('update/:id')
  @ApiOperation({ summary: '修改微信图片素材' })
  @ApiErrorResponse(WechatMaterialUpdateImageException)
  async update(
    @Param() { id }: WechatMaterialIdDTO,
    @Body() body: WechatMaterialImageDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.imageService.update(id, {
      id: terminal.id,
      target: terminal.target,
      body,
      userId: identity.userId,
    });
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除微信图片素材' })
  @ApiErrorResponse(WechatMaterialDeleteImageException)
  async delete(
    @Param() { id }: WechatMaterialIdDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.materialService.delete({
      terminalId: terminal.id,
      target: terminal.target,
      id,
      userId: identity.userId,
    });
  }

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取微信图片素材列表' })
  @ApiOkResponse({ type: [WechatMaterialEntity] })
  @ApiErrorResponse(WechatMaterialGetImageListException)
  async list(
    @Query() query: WechatMaterialListDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.materialService.list(
      WechatMaterialFileTypeEnum.IMAGE,
      query,
      terminal.target,
      terminal.id,
    );
  }
}
