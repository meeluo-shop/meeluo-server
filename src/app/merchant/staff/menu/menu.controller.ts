import {
  Inject,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiErrorResponse,
} from '@shared/swagger';
import { Identity, Authorize } from '@core/decorator';
import { MerchantStaffMenuService } from './menu.service';
import {
  MerchantMenuListDTO,
  MerchantMenuIdDTO,
  MerchantMenuIdListDTO,
  MerchantCreateMenuDTO,
  MerchantUpdateMenuDTO,
} from './menu.dto';
import { MerchantStaffMenuEntity } from '@typeorm/meeluoShop';
import {
  MerchantCreateMenuFailedException,
  MerchantUpdateMenuFailedException,
  MerchantGetMenusFailedException,
  MerchantGetMenuDetailFailedException,
  MerchantDeleteMenuFailedException,
} from './menu.exception';

@ApiTags('商户后台员工菜单相关接口')
@Controller('merchant/staff/menu')
export class MerchantStaffMenuController {
  constructor(
    @Inject(MerchantStaffMenuService)
    private menuService: MerchantStaffMenuService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取所有导航列表' })
  @ApiOkResponse({ type: [MerchantStaffMenuEntity] })
  @ApiErrorResponse(MerchantGetMenusFailedException)
  async list(
    @Query() query: MerchantMenuListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.menuService.list(query, identity);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取导航详情' })
  @ApiErrorResponse(MerchantGetMenuDetailFailedException)
  async detail(
    @Param() { id }: MerchantMenuIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.menuService.detail(id, identity);
  }

  @Authorize()
  @Delete('delete')
  @ApiOperation({ summary: '删除导航' })
  @ApiErrorResponse(MerchantDeleteMenuFailedException)
  async delete(
    @Body() body: MerchantMenuIdListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.menuService.delete(body, identity);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增导航' })
  @ApiErrorResponse(MerchantCreateMenuFailedException)
  async create(
    @Body() body: MerchantCreateMenuDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.menuService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改导航' })
  @ApiErrorResponse(MerchantUpdateMenuFailedException)
  async update(
    @Param() { id }: MerchantMenuIdDTO,
    @Body() body: MerchantUpdateMenuDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.menuService.update(id, body, identity);
  }
}
