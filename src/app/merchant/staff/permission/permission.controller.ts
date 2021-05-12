import { Inject, Controller, Get, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiErrorResponse,
} from '@shared/swagger';
import { Authorize } from '@core/decorator';
import { MerchantStaffPermissionService } from './permission.service';
import { MerchantPermListDTO, MerchantPermIdDTO } from './permission.dto';
import { MerchantStaffPermEntity } from '@typeorm/meeluoShop';
import {
  MerchantGetPermsFailedException,
  MerchantGetPermDetailFailedException,
} from './permission.exception';

@ApiTags('商户后台员工数据权限相关接口')
@Controller('merchant/staff/permission')
export class MerchantStaffPermissionController {
  constructor(
    @Inject(MerchantStaffPermissionService)
    private permService: MerchantStaffPermissionService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取所有数据权限列表' })
  @ApiOkResponse({ type: [MerchantStaffPermEntity] })
  @ApiErrorResponse(MerchantGetPermsFailedException)
  async list(@Query() query: MerchantPermListDTO) {
    return this.permService.list(query);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取数据权限详情' })
  @ApiErrorResponse(MerchantGetPermDetailFailedException)
  async detail(@Param() { id }: MerchantPermIdDTO) {
    return this.permService.detail(id);
  }
}
