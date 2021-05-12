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
import { Identity, Permissions } from '@core/decorator';
import { AdminGameCategoryEntity } from '@typeorm/meeluoShop';
import {
  ModifyAdminGameCategoryDTO,
  AdminGameCategoryIdDTO,
  AdminGameCategoryListDTO,
} from './category.dto';
import { AdminGameCategoryService } from './category.service';
import {
  DeleteAdminGameCategoryFailedException,
  GetAdminGameCategoryDetailFailedException,
  GetAdminGameCategorysFailedException,
  CreateAdminGameCategoryFailedException,
  UpdateAdminGameCategoryFailedException,
} from './category.exception';
import { READ_ADMIN_GAME, WRITE_ADMIN_GAME } from '@app/admin/permission';

@ApiTags('管理员后台游戏分类相关接口')
@Controller('admin/game/category')
export class AdminGameCategoryController {
  constructor(
    @Inject(AdminGameCategoryService)
    private categoryService: AdminGameCategoryService,
  ) {}

  @Permissions(WRITE_ADMIN_GAME)
  @Post('create')
  @ApiOperation({ summary: '新增游戏分类' })
  @ApiErrorResponse(CreateAdminGameCategoryFailedException)
  async create(
    @Body() body: ModifyAdminGameCategoryDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.categoryService.create(body, identity);
  }

  @Permissions(WRITE_ADMIN_GAME)
  @Put('update/:id')
  @ApiOperation({ summary: '修改游戏分类' })
  @ApiErrorResponse(UpdateAdminGameCategoryFailedException)
  async update(
    @Param() { id }: AdminGameCategoryIdDTO,
    @Body() body: ModifyAdminGameCategoryDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.categoryService.update(id, body, identity);
  }

  @Permissions(READ_ADMIN_GAME)
  @Get('list')
  @ApiOperation({ summary: '获取游戏分类列表' })
  @ApiOkResponse({ type: [AdminGameCategoryEntity] })
  @ApiErrorResponse(GetAdminGameCategorysFailedException)
  async list(@Query() query: AdminGameCategoryListDTO) {
    return this.categoryService.list(query);
  }

  @Permissions(READ_ADMIN_GAME)
  @Get('detail/:id')
  @ApiOperation({ summary: '获取游戏分类详情' })
  @ApiErrorResponse(GetAdminGameCategoryDetailFailedException)
  async detail(@Param() { id }: AdminGameCategoryIdDTO) {
    return this.categoryService.detail(id);
  }

  @Permissions(WRITE_ADMIN_GAME)
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除游戏分类' })
  @ApiErrorResponse(DeleteAdminGameCategoryFailedException)
  async delete(
    @Param() { id }: AdminGameCategoryIdDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.categoryService.delete(id, identity);
  }
}
