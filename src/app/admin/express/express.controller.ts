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
import { Permissions, Identity } from '@core/decorator';
import { AdminExpressService } from './express.service';
import {
  AdminExpressModifyDTO,
  AdminExpressListDTO,
  AdminExpressIdDTO,
} from './express.dto';
import {
  AdminExpressCreateException,
  AdminExpressDeleteException,
  AdminExpressGetDetailException,
  AdminExpressGetListException,
  AdminExpressUpdateException,
} from './express.exception';
import {
  READ_ADMIN_EXPRESS,
  WRITE_ADMIN_EXPRESS,
} from '../permission/permission.constant';
import { AdminExpressEntity } from '@typeorm/meeluoShop';

@ApiTags('物流公司相关接口')
@Controller('admin/express')
export class AdminExpressController {
  constructor(
    @Inject(AdminExpressService)
    private expressService: AdminExpressService,
  ) {}

  @Permissions(READ_ADMIN_EXPRESS)
  @Get('list')
  @ApiOperation({ summary: '获取物流公司列表' })
  @ApiOkResponse({ type: [AdminExpressEntity] })
  @ApiErrorResponse(AdminExpressGetListException)
  async list(@Query() query: AdminExpressListDTO) {
    return this.expressService.list(query);
  }

  @Permissions(READ_ADMIN_EXPRESS)
  @Get('detail/:id')
  @ApiOperation({ summary: '查看物流公司详情' })
  @ApiErrorResponse(AdminExpressGetDetailException)
  async detail(@Param() { id }: AdminExpressIdDTO) {
    return this.expressService.detail(id);
  }

  @Permissions(WRITE_ADMIN_EXPRESS)
  @Post('create')
  @ApiOperation({ summary: '新增物流公司' })
  @ApiErrorResponse(AdminExpressCreateException)
  async create(
    @Body() body: AdminExpressModifyDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.expressService.create(body, identity);
  }

  @Permissions(WRITE_ADMIN_EXPRESS)
  @Put('update/:id')
  @ApiOperation({ summary: '修改物流公司' })
  @ApiErrorResponse(AdminExpressUpdateException)
  async update(
    @Param() { id }: AdminExpressIdDTO,
    @Body() body: AdminExpressModifyDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.expressService.update(id, body, identity);
  }

  @Permissions(WRITE_ADMIN_EXPRESS)
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除物流公司' })
  @ApiErrorResponse(AdminExpressDeleteException)
  async delete(
    @Param() { id }: AdminExpressIdDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.expressService.delete(id, identity);
  }
}
