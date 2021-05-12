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
import { Identity, Permissions } from '@core/decorator';
import { AdminMenuService } from './menu.service';
import {
  AdminMenuListDTO,
  AdminMenuIdDTO,
  AdminMenuIdListDTO,
  AdminCreateMenuDTO,
  AdminUpdateMenuDTO,
} from './menu.dto';
import { AdminMenuEntity } from '@typeorm/meeluoShop';
import {
  AdminCreateMenuFailedException,
  AdminUpdateMenuFailedException,
  AdminGetMenusFailedException,
  AdminGetMenuDetailFailedException,
  AdminDeleteMenuFailedException,
} from './menu.exception';
import { READ_ADMIN_MENU, WRITE_ADMIN_MENU } from '../permission';

@ApiTags('管理员后台菜单相关接口')
@Controller('admin/menu')
export class AdminMenuController {
  constructor(
    @Inject(AdminMenuService) private menuService: AdminMenuService,
  ) {}

  @Permissions(READ_ADMIN_MENU)
  @Get('list')
  @ApiOperation({ summary: '获取所有导航列表' })
  @ApiOkResponse({ type: [AdminMenuEntity] })
  @ApiErrorResponse(AdminGetMenusFailedException)
  async list(@Query() query: AdminMenuListDTO) {
    return this.menuService.list(query);
  }

  @Permissions(READ_ADMIN_MENU)
  @Get('detail/:id')
  @ApiOperation({ summary: '获取导航详情' })
  @ApiErrorResponse(AdminGetMenuDetailFailedException)
  async detail(@Param() { id }: AdminMenuIdDTO) {
    return this.menuService.detail(id);
  }

  @Permissions(WRITE_ADMIN_MENU)
  @Delete('delete')
  @ApiOperation({ summary: '删除导航' })
  @ApiErrorResponse(AdminDeleteMenuFailedException)
  async delete(
    @Body() body: AdminMenuIdListDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.menuService.delete(body, identity);
  }

  @Permissions(WRITE_ADMIN_MENU)
  @Post('create')
  @ApiOperation({ summary: '新增导航' })
  @ApiErrorResponse(AdminCreateMenuFailedException)
  async create(
    @Body() body: AdminCreateMenuDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.menuService.create(body, identity);
  }

  @Permissions(WRITE_ADMIN_MENU)
  @Put('update/:id')
  @ApiOperation({ summary: '修改导航' })
  @ApiErrorResponse(AdminUpdateMenuFailedException)
  async update(
    @Param() { id }: AdminMenuIdDTO,
    @Body() body: AdminUpdateMenuDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.menuService.update(id, body, identity);
  }
}
