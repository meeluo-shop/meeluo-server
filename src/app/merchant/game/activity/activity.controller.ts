import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import {
  Controller,
  Post,
  Body,
  Inject,
  Put,
  Param,
  Get,
  Delete,
  Query,
} from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import {
  CreateMerchantGameFailedException,
  UpdateMerchantGameFailedException,
  GetMerchantGameDetailFailedException,
  DeleteMerchantGameFailedException,
  GetMerchantGameListFailedException,
  CheckMerchantGameStatusFailedException,
} from './activity.exception';
import {
  MerchantGameActivityDTO,
  MerchantGameIdDTO,
  MerchantGameActivityListDTO,
} from './activity.dto';
import { MerchantGameActivityService } from './activity.service';
import { MerchantGameActivityEntity } from '@typeorm/meeluoShop';

@ApiTags('商户后台游戏活动相关接口')
@Controller('merchant/game/activity')
export class MerchantGameActivityController {
  constructor(
    @Inject(MerchantGameActivityService)
    private activityService: MerchantGameActivityService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取游戏活动列表' })
  @ApiOkResponse({ type: [MerchantGameActivityEntity] })
  @ApiErrorResponse(GetMerchantGameListFailedException)
  async list(
    @Query() query: MerchantGameActivityListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.activityService.list(query, identity);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增游戏活动' })
  @ApiErrorResponse(CreateMerchantGameFailedException)
  async create(
    @Body() body: MerchantGameActivityDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.activityService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改游戏活动' })
  @ApiErrorResponse(UpdateMerchantGameFailedException)
  async update(
    @Param() { id }: MerchantGameIdDTO,
    @Body() body: MerchantGameActivityDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.activityService.update(id, body, identity);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取游戏活动详情' })
  @ApiErrorResponse(GetMerchantGameDetailFailedException)
  async detail(
    @Param() { id }: MerchantGameIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.activityService.detail(id, identity.merchantId);
  }

  @Authorize()
  @Get('check/:id')
  @ApiOperation({ summary: '检查游戏活动状态' })
  @ApiErrorResponse(CheckMerchantGameStatusFailedException)
  async check(
    @Param() { id }: MerchantGameIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.activityService.check(id, identity);
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除游戏活动' })
  @ApiErrorResponse(DeleteMerchantGameFailedException)
  async delete(
    @Param() { id }: MerchantGameIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.activityService.delete(id, identity);
  }
}
