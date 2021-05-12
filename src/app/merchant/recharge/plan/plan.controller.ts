import {
  Inject,
  Controller,
  Get,
  Put,
  Body,
  Post,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Authorize, Identity } from '@core/decorator';
import { MerchantRechargePlanService } from './plan.service';
import {
  AddRechargePlanException,
  GetRechargePlanListException,
  GetRechargePlanDetailException,
  UpdateRechargePlanException,
  DeleteRechargePlanException,
} from './plan.exception';
import {
  ModifyMerchantRechargePlanDTO,
  MerchantRechargePlanListDTO,
  MerchantRechargePlanIdDTO,
  MerchantRechargePlanIdListDTO,
} from './plan.dto';

@ApiTags('商户后台用户充值套餐相关接口')
@Controller('merchant/recharge/plan')
export class MerchantRechargePlanController {
  constructor(
    @Inject(MerchantRechargePlanService)
    private planService: MerchantRechargePlanService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取用户充值套餐列表' })
  @ApiErrorResponse(GetRechargePlanListException)
  async rechargePlanList(
    @Query() query: MerchantRechargePlanListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.planService.getRechargePlanList(query, identity.merchantId);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取用户充值套餐详情' })
  @ApiErrorResponse(GetRechargePlanDetailException)
  async rechargePlanDetail(
    @Param() { id }: MerchantRechargePlanIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.planService.getRechargePlanDetail(id, identity);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '增加用户充值套餐' })
  @ApiErrorResponse(AddRechargePlanException)
  async addRechargePlan(
    @Body() body: ModifyMerchantRechargePlanDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.planService.addRechargePlan(body, identity);
  }

  @Authorize()
  @Delete('delete')
  @ApiOperation({ summary: '删除用户充值套餐' })
  @ApiErrorResponse(DeleteRechargePlanException)
  async deleteRechargePlan(
    @Body() { ids }: MerchantRechargePlanIdListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.planService.deleteRechargePlan(ids, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改用户充值套餐' })
  @ApiErrorResponse(UpdateRechargePlanException)
  async updateRechargePlan(
    @Param() { id }: MerchantRechargePlanIdDTO,
    @Body() body: ModifyMerchantRechargePlanDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.planService.updateRechargePlan(id, body, identity);
  }
}
