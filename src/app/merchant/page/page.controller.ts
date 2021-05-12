import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import {
  Controller,
  Inject,
  Post,
  Body,
  Put,
  Param,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantPageService } from './page.service';
import {
  MerchantModifyPageDTO,
  MerchantPageIdDTO,
  MerchantPageListDTO,
  MerchantSetPageTypeDTO,
} from './page.dto';
import {
  GetMerchantPageesFailedException,
  CreateMerchantPageFailedException,
  UpdateMerchantPageFailedException,
  DeleteMerchantPageFailedException,
  GetMerchantPageDetailFailedException,
  UpdateMerchantPageTypeFailedException,
} from './page.exception';
import { MerchantPageEntity } from '@typeorm/meeluoShop';

@ApiTags('商户后台客户端页面配置相关接口')
@Controller('merchant/page')
export class MerchantPageController {
  constructor(
    @Inject(MerchantPageService)
    private pageService: MerchantPageService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取页面列表' })
  @ApiOkResponse({ type: [MerchantPageEntity] })
  @ApiErrorResponse(GetMerchantPageesFailedException)
  async list(
    @Query() query: MerchantPageListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.pageService.list(query, identity);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '查看页面详情' })
  @ApiErrorResponse(GetMerchantPageDetailFailedException)
  async detail(
    @Param() { id }: MerchantPageIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.pageService.detail(id, identity);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增页面' })
  @ApiErrorResponse(CreateMerchantPageFailedException)
  async create(
    @Body() body: MerchantModifyPageDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.pageService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改页面' })
  @ApiErrorResponse(UpdateMerchantPageFailedException)
  async update(
    @Param() { id }: MerchantPageIdDTO,
    @Body() body: MerchantModifyPageDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.pageService.update(id, body, identity);
  }

  @Authorize()
  @Put('set_type/:id')
  @ApiOperation({ summary: '设置页面类型' })
  @ApiErrorResponse(UpdateMerchantPageTypeFailedException)
  async setType(
    @Param() { id }: MerchantPageIdDTO,
    @Body() { type }: MerchantSetPageTypeDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.pageService.setType(id, type, identity);
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除页面' })
  @ApiErrorResponse(DeleteMerchantPageFailedException)
  async delete(
    @Param() { id }: MerchantPageIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.pageService.delete(id, identity);
  }
}
