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
import { AdminUserService } from './user.service';
import {
  AdminUserIdDTO,
  AdminUserListDTO,
  AdminUserActiveDTO,
  AdminUserIdListDTO,
  AdminModifyUserDTO,
} from './user.dto';
import {
  AdminActiveUserDetailException,
  AdminDeleteUserFailedException,
  AdminGetUsersFailedException,
  AdminUpdateUserFailedException,
  AdminCreateUserFailedException,
  AdminGetUserDetailFailedException,
} from './user.exception';
import { AdminUserEntity } from '@typeorm/meeluoShop';
import { READ_ADMIN_USER, WRITE_ADMIN_USER } from '../permission';

@ApiTags('管理员后台用户相关接口')
@Controller('admin/user')
export class AdminUserController {
  constructor(
    @Inject(AdminUserService) private userService: AdminUserService,
  ) {}

  @Permissions(READ_ADMIN_USER)
  @Get('list')
  @ApiOperation({ summary: '获取所有用户列表' })
  @ApiOkResponse({ type: [AdminUserEntity] })
  @ApiErrorResponse(AdminGetUsersFailedException)
  async list(@Query() query: AdminUserListDTO) {
    return this.userService.list(query);
  }

  @Permissions(READ_ADMIN_USER)
  @Get('detail/:id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiErrorResponse(AdminGetUserDetailFailedException)
  async detail(@Param() { id }: AdminUserIdDTO) {
    return this.userService.detail(id);
  }

  @Permissions(WRITE_ADMIN_USER)
  @Put('active/:id')
  @ApiOperation({ summary: '是否启用该管理员用户' })
  @ApiErrorResponse(AdminActiveUserDetailException)
  async active(
    @Param() { id }: AdminUserIdDTO,
    @Body() { isActive }: AdminUserActiveDTO,
    @Identity() identity,
  ) {
    return this.userService.active(id, isActive, identity);
  }

  @Permissions(WRITE_ADMIN_USER)
  @Post('create')
  @ApiOperation({ summary: '新增用户' })
  @ApiErrorResponse(AdminCreateUserFailedException)
  async create(
    @Body() body: AdminModifyUserDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.userService.create(body, identity);
  }

  @Permissions(WRITE_ADMIN_USER)
  @Put('update/:id')
  @ApiOperation({ summary: '修改用户信息' })
  @ApiErrorResponse(AdminUpdateUserFailedException)
  async update(
    @Param() param: AdminUserIdDTO,
    @Body() body: AdminModifyUserDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.userService.update(body, param.id, identity);
  }

  @Permissions(WRITE_ADMIN_USER)
  @Delete('delete')
  @ApiOperation({ summary: '删除用户' })
  @ApiErrorResponse(AdminDeleteUserFailedException)
  async delete(
    @Body() body: AdminUserIdListDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.userService.delete(body, identity);
  }
}
