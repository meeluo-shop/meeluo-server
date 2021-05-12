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
import { AdminPermissionService } from './permission.service';
import {
  AdminPermListDTO,
  AdminPermIdDTO,
  AdminPermIdListDTO,
  AdminCreatePermDTO,
  AdminUpdatePermDTO,
} from './permission.dto';
import { AdminPermEntity } from '@typeorm/meeluoShop';
import {
  AdminCreatePermFailedException,
  AdminUpdatePermFailedException,
  AdminGetPermsFailedException,
  AdminGetPermDetailFailedException,
  AdminDeletePermFailedException,
} from './permission.exception';
import { READ_ADMIN_PERM, WRITE_ADMIN_PERM } from './permission.constant';

@ApiTags('管理员后台数据权限相关接口')
@Controller('admin/permission')
export class AdminPermissionController {
  constructor(
    @Inject(AdminPermissionService) private permService: AdminPermissionService,
  ) {}

  @Permissions(READ_ADMIN_PERM)
  @Get('list')
  @ApiOperation({ summary: '获取所有数据权限列表' })
  @ApiOkResponse({ type: [AdminPermEntity] })
  @ApiErrorResponse(AdminGetPermsFailedException)
  async list(@Query() query: AdminPermListDTO) {
    return this.permService.list(query);
  }

  @Permissions(READ_ADMIN_PERM)
  @Get('detail/:id')
  @ApiOperation({ summary: '获取数据权限详情' })
  @ApiErrorResponse(AdminGetPermDetailFailedException)
  async detail(@Param() { id }: AdminPermIdDTO) {
    return this.permService.detail(id);
  }

  @Permissions(WRITE_ADMIN_PERM)
  @Delete('delete')
  @ApiOperation({ summary: '删除数据权限' })
  @ApiErrorResponse(AdminDeletePermFailedException)
  async delete(
    @Body() body: AdminPermIdListDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.permService.delete(body, identity);
  }

  @Permissions(WRITE_ADMIN_PERM)
  @Post('create')
  @ApiOperation({ summary: '新增数据权限' })
  @ApiErrorResponse(AdminCreatePermFailedException)
  async create(
    @Body() body: AdminCreatePermDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.permService.create(body, identity);
  }

  @Permissions(WRITE_ADMIN_PERM)
  @Put('update/:id')
  @ApiOperation({ summary: '修改数据权限' })
  @ApiErrorResponse(AdminUpdatePermFailedException)
  async update(
    @Param() { id }: AdminPermIdDTO,
    @Body() body: AdminUpdatePermDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.permService.update(id, body, identity);
  }
}
