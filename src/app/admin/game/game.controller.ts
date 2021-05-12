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
import { AdminGameService } from './game.service';
import { Permissions, Identity, Authorize } from '@core/decorator';
import { WRITE_ADMIN_GAME, READ_ADMIN_GAME } from '../permission';
import {
  CreateAdminGameFailedException,
  UpdateAdminGameFailedException,
  GetAdminGameListFailedException,
  GetAdminGameDetailFailedException,
  DeleteAdminGameFailedException,
  AdminGameSetSessionException,
} from './game.exception';
import {
  ModifyAdminGameDTO,
  AdminGameIdDTO,
  AdminGameListDTO,
} from './game.dto';
import { AdminGameEntity } from '@typeorm/meeluoShop';

@ApiTags('管理员后台游戏管理相关接口')
@Controller('admin/game')
export class AdminGameController {
  constructor(
    @Inject(AdminGameService)
    private gameService: AdminGameService,
  ) {}

  @Permissions(READ_ADMIN_GAME)
  @Get('list')
  @ApiOperation({ summary: '获取游戏列表' })
  @ApiOkResponse({ type: [AdminGameEntity] })
  @ApiErrorResponse(GetAdminGameListFailedException)
  async list(@Query() query: AdminGameListDTO) {
    return this.gameService.list(query);
  }

  @Permissions(READ_ADMIN_GAME)
  @Get('detail/:id')
  @ApiOperation({ summary: '获取游戏详情' })
  @ApiErrorResponse(GetAdminGameDetailFailedException)
  async detail(@Param() { id }: AdminGameIdDTO) {
    return this.gameService.detail(id);
  }

  @Permissions(WRITE_ADMIN_GAME)
  @Post('create')
  @ApiOperation({ summary: '创建游戏' })
  @ApiErrorResponse(CreateAdminGameFailedException)
  async create(
    @Body() body: ModifyAdminGameDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.gameService.create(body, identity);
  }

  @Permissions(WRITE_ADMIN_GAME)
  @Put('update/:id')
  @ApiOperation({ summary: '修改游戏' })
  @ApiErrorResponse(UpdateAdminGameFailedException)
  async update(
    @Param() { id }: AdminGameIdDTO,
    @Body() body: ModifyAdminGameDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.gameService.update(id, body, identity);
  }

  @Permissions(WRITE_ADMIN_GAME)
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除游戏' })
  @ApiErrorResponse(DeleteAdminGameFailedException)
  async delete(
    @Param() { id }: AdminGameIdDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.gameService.delete(id, identity);
  }

  @Authorize()
  @Post('session/:id')
  @ApiOperation({ summary: '预览游戏时生成游戏会话' })
  @ApiErrorResponse(AdminGameSetSessionException)
  async gameSession(
    @Param() { id }: AdminGameIdDTO,
    @Identity() { userId }: AdminIdentity,
  ) {
    return this.gameService.setUserGameSession({
      userId,
      gameId: id,
    });
  }
}
