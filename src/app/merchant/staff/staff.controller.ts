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
import { MerchantStaffService } from './staff.service';
import {
  MerchantStaffIdDTO,
  MerchantStaffListDTO,
  MerchantStaffActiveDTO,
  MerchantStaffIdListDTO,
  MerchantModifyStaffDTO,
  MerchantStaffBindWechatUserDTO,
} from './staff.dto';
import {
  MerchantActiveStaffDetailException,
  MerchantDeleteStaffFailedException,
  MerchantGetStaffsFailedException,
  MerchantUpdateStaffFailedException,
  MerchantCreateStaffFailedException,
  MerchantGetStaffDetailFailedException,
  MerchantStaffBindWechatUserException,
} from './staff.exception';
import { MerchantStaffEntity } from '@typeorm/meeluoShop';

@ApiTags('商户后台员工相关接口')
@Controller('merchant/staff')
export class MerchantStaffController {
  constructor(
    @Inject(MerchantStaffService) private staffService: MerchantStaffService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取商户下所有员工列表' })
  @ApiOkResponse({ type: [MerchantStaffEntity] })
  @ApiErrorResponse(MerchantGetStaffsFailedException)
  async list(
    @Query() query: MerchantStaffListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.staffService.list(query, identity);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取员工详情' })
  @ApiErrorResponse(MerchantGetStaffDetailFailedException)
  async detail(
    @Param() { id }: MerchantStaffIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.staffService.detail(id, identity);
  }

  @Authorize()
  @Put('active/:id')
  @ApiOperation({ summary: '是否启用该员工' })
  @ApiErrorResponse(MerchantActiveStaffDetailException)
  async active(
    @Param() { id }: MerchantStaffIdDTO,
    @Body() { isActive }: MerchantStaffActiveDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.staffService.active(id, isActive, identity);
  }

  @Authorize()
  @Put('bind_wechat_user/:id')
  @ApiOperation({ summary: '给员工绑定微信用户' })
  @ApiErrorResponse(MerchantStaffBindWechatUserException)
  async bindWechatUser(
    @Param() { id }: MerchantStaffIdDTO,
    @Body() { openid }: MerchantStaffBindWechatUserDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.staffService.setWechatUser(id, openid, identity);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增员工' })
  @ApiErrorResponse(MerchantCreateStaffFailedException)
  async create(
    @Body() body: MerchantModifyStaffDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.staffService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改员工信息' })
  @ApiErrorResponse(MerchantUpdateStaffFailedException)
  async update(
    @Param() param: MerchantStaffIdDTO,
    @Body() body: MerchantModifyStaffDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.staffService.update(body, param.id, identity);
  }

  @Authorize()
  @Delete('delete')
  @ApiOperation({ summary: '删除员工' })
  @ApiErrorResponse(MerchantDeleteStaffFailedException)
  async delete(
    @Body() body: MerchantStaffIdListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.staffService.delete(body, identity);
  }
}
