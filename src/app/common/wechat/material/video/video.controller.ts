import { Authorize, Identity } from '@core/decorator';
import { File } from 'fastify-multer/lib/interfaces';
import { FileInterceptor } from '@webundsoehne/nest-fastify-file-upload';
import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import { WechatMaterialListDTO, WechatMaterialIdDTO } from '../material.dto';
import {
  WechatMaterialAddVideoException,
  WechatMaterialGetVideoException,
  WechatMaterialUpdateVideoException,
  WechatMaterialDeleteVideoException,
  WechatMaterialGetVideoListException,
} from './video.exception';
import {
  WechatMaterialEntity,
  WechatMaterialFileTypeEnum,
} from '@typeorm/meeluoShop';
import { WechatMaterialVideoService } from './video.service';
import { WechatMaterialService } from '../material.service';
import { WechatMaterialVideoDTO } from './video.dto';
import { CommonService } from '@app/common/common.service';

@ApiTags('微信视频素材相关接口')
@Controller('common/wechat/material/video')
export class WechatMaterialVideoController {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatMaterialVideoService)
    private videoService: WechatMaterialVideoService,
    @Inject(WechatMaterialService)
    private materialService: WechatMaterialService,
  ) {}

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增微信视频素材' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiErrorResponse(WechatMaterialAddVideoException)
  async create(
    @UploadedFile() file: File,
    @Query() { name, introduction }: WechatMaterialVideoDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.videoService.create({
      name,
      file,
      target: terminal.target,
      terminalId: terminal.id,
      userId: identity.userId,
      introduction,
    });
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '查看微信视频素材' })
  @ApiErrorResponse(WechatMaterialGetVideoException)
  async detail(
    @Param() { id }: WechatMaterialIdDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.materialService.detail({
      id,
      target: terminal.target,
      terminalId: terminal.id,
    });
  }

  @Authorize()
  @Post('update/:id')
  @ApiOperation({ summary: '修改微信视频素材' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiErrorResponse(WechatMaterialUpdateVideoException)
  async update(
    @UploadedFile() file: File,
    @Param() { id }: WechatMaterialIdDTO,
    @Query() { name, introduction }: WechatMaterialVideoDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.videoService.update({
      materialId: id,
      name,
      file,
      target: terminal.target,
      terminalId: terminal.id,
      userId: identity.userId,
      introduction,
    });
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除微信视频素材' })
  @ApiErrorResponse(WechatMaterialDeleteVideoException)
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

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取微信视频素材列表' })
  @ApiOkResponse({ type: [WechatMaterialEntity] })
  @ApiErrorResponse(WechatMaterialGetVideoListException)
  async list(
    @Query() query: WechatMaterialListDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.materialService.list(
      WechatMaterialFileTypeEnum.VIDEO,
      query,
      terminal.target,
      terminal.id,
    );
  }
}
