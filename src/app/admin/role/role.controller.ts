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
import { AdminMenuIdListDTO } from '@app/admin/menu';
import { AdminPermIdListDTO } from '@app/admin/permission';
import { AdminRoleService } from './role.service';
import {
  AdminRoleListDTO,
  AdminRoleIdDTO,
  AdminRoleIdListDTO,
  AdminModifyRoleDTO,
  AdminRoleDetailDTO,
} from './role.dto';
import {
  AdminRoleEntity,
  AdminMenuEntity,
  AdminPermEntity,
} from '@typeorm/meeluoShop';
import {
  AdminCreateRoleFailedException,
  AdminUpdateRoleFailedException,
  AdminGetRolesFailedException,
  AdminGetRoleDetailFailedException,
  AdminDeleteRoleFailedException,
  AdminGetRoleMenusException,
  AdminGetRolePermsException,
  AdminRoleBindPermsException,
  AdminRoleBindMenusException,
} from './role.exception';
import {
  READ_ADMIN_ROLE,
  WRITE_ADMIN_ROLE,
  READ_ADMIN_MENU,
  READ_ADMIN_PERM,
  WRITE_ADMIN_PERM,
  WRITE_ADMIN_MENU,
} from '../permission';

@ApiTags('管理员后台角色相关接口')
@Controller('admin/role')
export class AdminRoleController {
  constructor(
    @Inject(AdminRoleService) private roleService: AdminRoleService,
  ) {}

  @Permissions(READ_ADMIN_ROLE)
  @Get('list')
  @ApiOperation({ summary: '获取所有角色列表' })
  @ApiOkResponse({ type: [AdminRoleEntity] })
  @ApiErrorResponse(AdminGetRolesFailedException)
  async list(@Query() query: AdminRoleListDTO) {
    return this.roleService.list(query);
  }

  @Permissions(READ_ADMIN_ROLE)
  @Get('detail/:id')
  @ApiOperation({ summary: '获取角色详情' })
  @ApiErrorResponse(AdminGetRoleDetailFailedException)
  async detail(
    @Param() { id }: AdminRoleIdDTO,
    @Query() { hasMenus, hasPermissions }: AdminRoleDetailDTO,
  ) {
    return this.roleService.detail(id, {
      hasMenus,
      hasPermissions,
    });
  }

  @Permissions(WRITE_ADMIN_ROLE)
  @Delete('delete')
  @ApiOperation({ summary: '删除角色' })
  @ApiErrorResponse(AdminDeleteRoleFailedException)
  async delete(
    @Body() body: AdminRoleIdListDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.roleService.delete(body, identity);
  }

  @Permissions(WRITE_ADMIN_ROLE)
  @Post('create')
  @ApiOperation({ summary: '新增角色' })
  @ApiErrorResponse(AdminCreateRoleFailedException)
  async create(
    @Body() body: AdminModifyRoleDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.roleService.create(body, identity);
  }

  @Permissions(WRITE_ADMIN_ROLE)
  @Put('update/:id')
  @ApiOperation({ summary: '修改角色' })
  @ApiErrorResponse(AdminUpdateRoleFailedException)
  async update(
    @Param() { id }: AdminRoleIdDTO,
    @Body() body: AdminModifyRoleDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.roleService.update(id, body, identity);
  }

  @Permissions([READ_ADMIN_ROLE, READ_ADMIN_MENU])
  @Get('menus/:id')
  @ApiOperation({ summary: '获取角色下的导航列表' })
  @ApiOkResponse({ type: [AdminMenuEntity] })
  @ApiErrorResponse(AdminGetRoleMenusException)
  async menus(@Param() { id }: AdminRoleIdDTO) {
    const role = this.roleService.generateEntity(id, AdminRoleEntity);
    const powers = await this.roleService.getRoleMenus([role]);
    return powers.menus;
  }

  @Permissions([READ_ADMIN_ROLE, READ_ADMIN_PERM])
  @Get('permissions/:id')
  @ApiOperation({ summary: '获取角色下的权限列表' })
  @ApiOkResponse({ type: [AdminPermEntity] })
  @ApiErrorResponse(AdminGetRolePermsException)
  async permissions(@Param() { id }: AdminRoleIdDTO) {
    const role = this.roleService.generateEntity(id, AdminRoleEntity);
    const powers = await this.roleService.getRolePerms([role]);
    return powers.permissions;
  }

  @Permissions([WRITE_ADMIN_ROLE, WRITE_ADMIN_PERM])
  @Post('permissions/bind/:id')
  @ApiOperation({ summary: '给角色绑定权限' })
  @ApiErrorResponse(AdminRoleBindPermsException)
  async bindPermissions(
    @Param() { id }: AdminRoleIdDTO,
    @Body() { ids }: AdminPermIdListDTO,
  ) {
    return this.roleService.bindPermissions({
      roleId: id,
      permIds: ids,
    });
  }

  @Permissions([WRITE_ADMIN_ROLE, WRITE_ADMIN_MENU])
  @Post('menus/bind/:id')
  @ApiOperation({ summary: '给角色绑定到导航' })
  @ApiErrorResponse(AdminRoleBindMenusException)
  async bindMenus(
    @Param() { id }: AdminRoleIdDTO,
    @Body() { ids }: AdminMenuIdListDTO,
  ) {
    return this.roleService.bindMenus({
      roleId: id,
      menuIds: ids,
    });
  }
}
