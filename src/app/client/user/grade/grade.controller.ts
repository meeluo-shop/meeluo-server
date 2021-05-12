import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import { Controller, Inject, Get, Query } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { ClientUserGradeService } from './grade.service';
import { ClientUserGradeListDTO } from './grade.dto';
import { ClientUserGradeGetListException } from './grade.exception';
import { MerchantUserGradeEntity } from '@typeorm/meeluoShop';

@ApiTags('客户端用户会员等级相关接口')
@Controller('client/user/grade')
export class ClientUserGradeController {
  constructor(
    @Inject(ClientUserGradeService)
    private gradeService: ClientUserGradeService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取用户会员等级列表' })
  @ApiOkResponse({ type: [MerchantUserGradeEntity] })
  @ApiErrorResponse(ClientUserGradeGetListException)
  async list(
    @Query() query: ClientUserGradeListDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gradeService.list(query, identity.merchantId);
  }
}
