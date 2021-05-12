import {
  Inject,
  Controller,
  Get,
  Query,
  Put,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiErrorResponse,
} from '@shared/swagger';
import { Identity, Authorize } from '@core/decorator';
import { MerchantUserService } from './user.service';
import { MerchantUserEntity } from '@typeorm/meeluoShop';
import {
  MerchantGetUsersFailedException,
  MerchantActiveUserException,
  MerchantUpdateUserException,
} from './user.exception';
import {
  MerchantUserListDTO,
  MerchantUserActiveDTO,
  MerchantUserIdDTO,
  MerchantModifyUserDTO,
} from './user.dto';

@ApiTags('商户后台用户相关接口')
@Controller('merchant/user')
export class MerchantUserController {
  constructor(
    @Inject(MerchantUserService) private userService: MerchantUserService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取商户下所有用户列表' })
  @ApiOkResponse({ type: [MerchantUserEntity] })
  @ApiErrorResponse(MerchantGetUsersFailedException)
  async list(
    @Query() query: MerchantUserListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.userService.list(query, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改用户信息' })
  @ApiErrorResponse(MerchantUpdateUserException)
  async update(
    @Param() { id }: MerchantUserIdDTO,
    @Body() body: MerchantModifyUserDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.userService.update(id, body, identity);
  }

  @Authorize()
  @Put('active/:id')
  @ApiOperation({ summary: '是否启用该用户' })
  @ApiErrorResponse(MerchantActiveUserException)
  async active(
    @Param() { id }: MerchantUserIdDTO,
    @Body() { isActive }: MerchantUserActiveDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.userService.active(id, isActive, identity);
  }
}
