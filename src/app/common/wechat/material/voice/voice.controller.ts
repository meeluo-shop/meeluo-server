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
import {
  WechatMaterialNameDTO,
  WechatMaterialListDTO,
  WechatMaterialIdDTO,
} from '../material.dto';
import {
  WechatMaterialAddVoiceException,
  WechatMaterialGetVoiceException,
  WechatMaterialUpdateVoiceException,
  WechatMaterialDeleteVoiceException,
  WechatMaterialGetVoiceListException,
} from './voice.exception';
import {
  WechatMaterialEntity,
  WechatMaterialFileTypeEnum,
} from '@typeorm/meeluoShop';
import { WechatMaterialVoiceService } from './voice.service';
import { WechatMaterialService } from '../material.service';
import { CommonService } from '@app/common/common.service';

@ApiTags('微信音频素材相关接口')
@Controller('common/wechat/material/voice')
export class WechatMaterialVoiceController {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatMaterialVoiceService)
    private voiceService: WechatMaterialVoiceService,
    @Inject(WechatMaterialService)
    private materialService: WechatMaterialService,
  ) {}

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增微信音频素材' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiErrorResponse(WechatMaterialAddVoiceException)
  async create(
    @UploadedFile() file: File,
    @Query() { name }: WechatMaterialNameDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.voiceService.create({
      name,
      file,
      terminalId: terminal.id,
      target: terminal.target,
      userId: identity.userId,
    });
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '查看微信音频素材' })
  @ApiErrorResponse(WechatMaterialGetVoiceException)
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
  @Post('update/:id')
  @ApiOperation({ summary: '修改微信音频素材' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiErrorResponse(WechatMaterialUpdateVoiceException)
  async update(
    @UploadedFile() file: File,
    @Param() { id }: WechatMaterialIdDTO,
    @Query() { name }: WechatMaterialNameDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.voiceService.update({
      materialId: id,
      name,
      file,
      terminalId: terminal.id,
      target: terminal.target,
      userId: identity.userId,
    });
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除微信音频素材' })
  @ApiErrorResponse(WechatMaterialDeleteVoiceException)
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
  @ApiOperation({ summary: '获取微信音频素材列表' })
  @ApiOkResponse({ type: [WechatMaterialEntity] })
  @ApiErrorResponse(WechatMaterialGetVoiceListException)
  async list(
    @Query() query: WechatMaterialListDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.materialService.list(
      WechatMaterialFileTypeEnum.VOICE,
      query,
      terminal.target,
      terminal.id,
    );
  }
}
