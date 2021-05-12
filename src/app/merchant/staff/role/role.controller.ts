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
import { MerchantMenuIdListDTO } from '../menu';
import { MerchantPermIdListDTO } from '../permission';
import { MerchantRoleService } from './role.service';
import {
  MerchantRoleListDTO,
  MerchantRoleIdDTO,
  MerchantRoleIdListDTO,
  MerchantModifyRoleDTO,
  MerchantRoleDetailDTO,
} from './role.dto';
import {
  MerchantStaffRoleEntity,
  MerchantStaffMenuEntity,
  MerchantStaffPermEntity,
} from '@typeorm/meeluoShop';
import {
  MerchantCreateRoleFailedException,
  MerchantUpdateRoleFailedException,
  MerchantGetRolesFailedException,
  MerchantGetRoleDetailFailedException,
  MerchantDeleteRoleFailedException,
  MerchantGetRoleMenusException,
  MerchantGetRolePermsException,
  MerchantRoleBindPermsException,
  MerchantRoleBindMenusException,
} from './role.exception';

@ApiTags('商户后台员工角色相关接口')
@Controller('merchant/staff/role')
export class MerchantRoleController {
  constructor(
    @Inject(MerchantRoleService) private roleService: MerchantRoleService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取所有角色列表' })
  @ApiOkResponse({ type: [MerchantStaffRoleEntity] })
  @ApiErrorResponse(MerchantGetRolesFailedException)
  async list(
    @Query() query: MerchantRoleListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.roleService.list(query, identity);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取角色详情' })
  @ApiErrorResponse(MerchantGetRoleDetailFailedException)
  async detail(
    @Param() { id }: MerchantRoleIdDTO,
    @Query() { hasMenus, hasPermissions }: MerchantRoleDetailDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.roleService.detail(
      id,
      {
        hasMenus,
        hasPermissions,
      },
      identity,
    );
  }

  @Authorize()
  @Delete('delete')
  @ApiOperation({ summary: '删除角色' })
  @ApiErrorResponse(MerchantDeleteRoleFailedException)
  async delete(
    @Body() body: MerchantRoleIdListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.roleService.delete(body, identity);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增角色' })
  @ApiErrorResponse(MerchantCreateRoleFailedException)
  async create(
    @Body() body: MerchantModifyRoleDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.roleService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改角色' })
  @ApiErrorResponse(MerchantUpdateRoleFailedException)
  async update(
    @Param() { id }: MerchantRoleIdDTO,
    @Body() body: MerchantModifyRoleDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.roleService.update(id, body, identity);
  }

  @Authorize()
  @Get('menus/:id')
  @ApiOperation({ summary: '获取角色下的导航列表' })
  @ApiOkResponse({ type: [MerchantStaffMenuEntity] })
  @ApiErrorResponse(MerchantGetRoleMenusException)
  async menus(
    @Param() { id }: MerchantRoleIdDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    const roleIds = await this.roleService.checkRoles([id], merchantId);
    const roles = this.roleService.generateEntity(
      roleIds,
      MerchantStaffRoleEntity,
    );
    const powers = await this.roleService.getRoleMenus(roles);
    return powers.menus;
  }

  @Authorize()
  @Get('permissions/:id')
  @ApiOperation({ summary: '获取角色下的权限列表' })
  @ApiOkResponse({ type: [MerchantStaffPermEntity] })
  @ApiErrorResponse(MerchantGetRolePermsException)
  async permissions(
    @Param() { id }: MerchantRoleIdDTO,
    @Identity() { merchantId }: MerchantIdentity,
  ) {
    const roleIds = await this.roleService.checkRoles([id], merchantId);
    const roles = this.roleService.generateEntity(
      roleIds,
      MerchantStaffRoleEntity,
    );
    const powers = await this.roleService.getRolePerms(roles);
    return powers.permissions;
  }

  @Authorize()
  @Post('permissions/bind/:id')
  @ApiOperation({ summary: '给角色绑定权限' })
  @ApiErrorResponse(MerchantRoleBindPermsException)
  async bindPermissions(
    @Param() { id }: MerchantRoleIdDTO,
    @Body() { ids }: MerchantPermIdListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.roleService.bindPermissions(
      {
        roleId: id,
        permIds: ids,
      },
      identity,
    );
  }

  @Authorize()
  @Post('menus/bind/:id')
  @ApiOperation({ summary: '给角色绑定到导航' })
  @ApiErrorResponse(MerchantRoleBindMenusException)
  async bindMenus(
    @Param() { id }: MerchantRoleIdDTO,
    @Body() { ids }: MerchantMenuIdListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.roleService.bindMenus(
      {
        roleId: id,
        menuIds: ids,
      },
      identity,
    );
  }
}
