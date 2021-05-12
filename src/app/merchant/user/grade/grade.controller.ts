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
  Delete,
  Query,
} from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantUserGradeEntity } from '@typeorm/meeluoShop';
import { MerchantUserGradeService } from './grade.service';
import {
  ModifyMerchantUserGradeDTO,
  MerchantUserGradeIdDTO,
  MerchantUserGradeListDTO,
} from './grade.dto';
import {
  CreateMerchantUserGradeFailedException,
  UpdateMerchantUserGradeFailedException,
  DeleteMerchantUserGradeFailedException,
  GetMerchantUserGradeDetailFailedException,
  GetMerchantUserGradeListFailedException,
} from './grade.exception';

@ApiTags('商户后台用户会员等级相关接口')
@Controller('merchant/user/grade')
export class MerchantUserGradeController {
  constructor(
    @Inject(MerchantUserGradeService)
    private gradeService: MerchantUserGradeService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取用户会员等级列表' })
  @ApiOkResponse({ type: [MerchantUserGradeEntity] })
  @ApiErrorResponse(GetMerchantUserGradeListFailedException)
  async list(
    @Query() query: MerchantUserGradeListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.gradeService.list(query, identity.merchantId);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增用户会员等级' })
  @ApiErrorResponse(CreateMerchantUserGradeFailedException)
  async create(
    @Body() body: ModifyMerchantUserGradeDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.gradeService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改用户会员等级' })
  @ApiErrorResponse(UpdateMerchantUserGradeFailedException)
  async update(
    @Param() { id }: MerchantUserGradeIdDTO,
    @Body() body: ModifyMerchantUserGradeDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.gradeService.update(id, body, identity);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取用户会员等级详情' })
  @ApiErrorResponse(GetMerchantUserGradeDetailFailedException)
  async detail(
    @Param() { id }: MerchantUserGradeIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.gradeService.detail(id, identity);
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除用户会员等级' })
  @ApiErrorResponse(DeleteMerchantUserGradeFailedException)
  async delete(
    @Param() { id }: MerchantUserGradeIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.gradeService.delete(id, identity);
  }
}
