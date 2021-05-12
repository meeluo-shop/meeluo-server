import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiErrorResponse,
  ApiCreatedResponse,
} from '@shared/swagger';
import {
  Controller,
  Inject,
  Get,
  Query,
  Put,
  Param,
  Body,
  Post,
} from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { AdminGameCategoryListDTO } from '@app/admin/game';
import {
  MerchantGameListDTO,
  MerchantGameActiveDTO,
  ModifyMerchantGameInfoDTO,
  MerchantGameIdsDTO,
  MerchantGameOrderListDTO,
  MerchantGameInviteListDTO,
} from './game.dto';
import {
  MerchantUpdateGameFailedException,
  GetSystemGameListFailedException,
  GetSystemGameCategorysFailedException,
  ActiveMerchantGameFailedException,
  MerchantGetGameDetailFailedException,
  MerchantGameSetSessionException,
  MerchantGameInviteListException,
  MerchantGameOrderListException,
} from './game.exception';
import {
  AdminGameEntity,
  AdminGameCategoryEntity,
  MerchantGameInviteEntity,
  MerchantGameOrderEntity,
} from '@typeorm/meeluoShop';
import { MerchantGameService } from './game.service';
import { MerchantGameIdDTO } from './activity';

@ApiTags('商户后台游戏相关接口')
@Controller('merchant/game')
export class MerchantGameController {
  constructor(
    @Inject(MerchantGameService)
    private gameService: MerchantGameService,
  ) {}

  @Authorize()
  @Get('category/list')
  @ApiOperation({ summary: '获取游戏分类列表' })
  @ApiOkResponse({ type: [AdminGameCategoryEntity] })
  @ApiErrorResponse(GetSystemGameCategorysFailedException)
  async categoryList(@Query() query: AdminGameCategoryListDTO) {
    return this.gameService.categoryList(query);
  }

  @Authorize()
  @Post('list')
  @ApiOperation({ summary: '获取所有游戏列表' })
  @ApiCreatedResponse({ type: [AdminGameEntity] })
  @ApiErrorResponse(GetSystemGameListFailedException)
  async list(
    @Query() query: MerchantGameListDTO,
    @Body() body: MerchantGameIdsDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.gameService.list(query, body, identity.merchantId);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取游戏详情' })
  @ApiErrorResponse(MerchantGetGameDetailFailedException)
  async detail(
    @Param() { id }: MerchantGameIdDTO,
    @Identity() { merchantId, userId }: MerchantIdentity,
  ) {
    return this.gameService.detail(id, merchantId, userId);
  }

  @Authorize()
  @Put('active/:id')
  @ApiOperation({ summary: '是否启用该游戏' })
  @ApiErrorResponse(ActiveMerchantGameFailedException)
  async active(
    @Param() { id }: MerchantGameIdDTO,
    @Body() { isActive }: MerchantGameActiveDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.gameService.active(id, isActive, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '商家修改游戏信息' })
  @ApiErrorResponse(MerchantUpdateGameFailedException)
  async update(
    @Param() { id }: MerchantGameIdDTO,
    @Body() body: ModifyMerchantGameInfoDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.gameService.update(id, body, identity);
  }

  @Authorize()
  @Post('session/:id')
  @ApiOperation({ summary: '预览游戏时生成游戏会话' })
  @ApiErrorResponse(MerchantGameSetSessionException)
  async gameSession(
    @Param() { id }: MerchantGameIdDTO,
    @Identity() { userId, merchantId }: MerchantIdentity,
  ) {
    return this.gameService.setUserGameSession({
      userId,
      merchantId,
      gameId: id,
    });
  }

  @Authorize()
  @Get('invite_list')
  @ApiOperation({ summary: '获取游戏邀请记录列表' })
  @ApiCreatedResponse({ type: [MerchantGameInviteEntity] })
  @ApiErrorResponse(MerchantGameInviteListException)
  async inviteList(
    @Query() query: MerchantGameInviteListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.gameService.inviteList(query, identity);
  }

  @Authorize()
  @Get('order_list')
  @ApiOperation({ summary: '获取游戏付费订单列表' })
  @ApiCreatedResponse({ type: [MerchantGameOrderEntity] })
  @ApiErrorResponse(MerchantGameOrderListException)
  async orderList(
    @Query() query: MerchantGameOrderListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.gameService.orderList(query, identity);
  }
}
