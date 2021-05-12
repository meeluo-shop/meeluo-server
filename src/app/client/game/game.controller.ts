import { FastifyRequest } from 'fastify';
import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@shared/swagger';
import {
  Controller,
  Inject,
  Post,
  Get,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { ClientGamePlayGameException } from './game.exception';
import { Authorize, Identity } from '@core/decorator';
import {
  AdminGameCategoryEntity,
  AdminGameEntity,
  MerchantGameRankingEntity,
} from '@typeorm/meeluoShop';
import { ClientGameService } from './game.service';
import {
  ClientGameIdDTO,
  ClientGameIdsDTO,
  ClientGameOverDTO,
  ClientGameListByPrizeDTO,
  ClientGameListByPrizeResp,
  ClientGameLeaveWordDTO,
  ClientGameGetRankingDTO,
  ClientGameSignDTO,
  ClientGameOrderIdDTO,
  ClientGameCheckSessionDTO,
  ClientGameInviteRewardDTO,
} from './game.dto';
import { MerchantGameListDTO } from '@app/merchant/game/game.dto';
import {
  ClientGameGetDetailException,
  ClientGetGameListException,
  ClientGameGameOverException,
  ClientGameLeaveWordException,
  ClientGetGameRankingListException,
  ClientGetGameMaxRankingException,
  ClientGetGameCategoryListException,
  ClientGamePaySessionException,
  ClientGameCheckSessionException,
  ClientGameBalancePayFailedException,
  ClientGameGetQRCodeException,
  ClientGameInviteRewardException,
} from './game.exception';
import { AdminGameCategoryListDTO } from '@app/admin/game';

@ApiTags('客户端游戏相关接口')
@Controller('client/game')
export class ClientGameController {
  constructor(
    @Inject(ClientGameService)
    private gameService: ClientGameService,
  ) {}

  @Authorize()
  @Get('category/list')
  @ApiOperation({ summary: '获取游戏分类列表' })
  @ApiOkResponse({ type: [AdminGameCategoryEntity] })
  @ApiErrorResponse(ClientGetGameCategoryListException)
  async categoryList(@Query() query: AdminGameCategoryListDTO) {
    return this.gameService.categoryList(query);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取游戏详情' })
  @ApiErrorResponse(ClientGameGetDetailException)
  async detail(
    @Param() { id }: ClientGameIdDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gameService.detail(id, identity);
  }

  @Get('info')
  @ApiOperation({ summary: '无需授权获取的游戏详情' })
  @ApiErrorResponse(ClientGameGetDetailException)
  async info(
    @Query() query: ClientGameCheckSessionDTO,
  ) {
    return this.gameService.info(query);
  }

  @Authorize()
  @Post('play_game/:id')
  @ApiOperation({ summary: '用户参与游戏接口' })
  @ApiErrorResponse(ClientGamePlayGameException)
  async playGame(
    @Req() request: FastifyRequest,
    @Param() { id }: ClientGameIdDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gameService.playGame(id, identity, request);
  }

  @Authorize()
  @Post('game_over/:id')
  @ApiOperation({ summary: '用户挑战游戏结束接口' })
  @ApiErrorResponse(ClientGameGameOverException)
  async gameOver(
    @Param() { id }: ClientGameIdDTO,
    @Body() body: ClientGameOverDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gameService.gameOver(id, body, identity);
  }

  @Post('check_session')
  @ApiOperation({ summary: '游戏页面校验用户session' })
  @ApiErrorResponse(ClientGameCheckSessionException)
  async checkSession(
    @Body() body: ClientGameCheckSessionDTO,
  ) {
    return this.gameService.checkGameSession(body);
  }

  @Authorize()
  @Post('pay_session/:id')
  @ApiOperation({ summary: '微信支付成功后生成游戏挑战会话' })
  @ApiErrorResponse(ClientGamePaySessionException)
  async wechatPaySession(
    @Body() body: ClientGameSignDTO,
    @Param() { id }: ClientGameIdDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gameService.setWechatPayGameSession(id, body, identity);
  }

  @Authorize()
  @Post('balance_pay/:orderId')
  @ApiOperation({ summary: '使用余额支付游戏挑战费用' })
  @ApiErrorResponse(ClientGameBalancePayFailedException)
  async balancePay(
    @Param() { orderId }: ClientGameOrderIdDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gameService.balancePay(orderId, identity);
  }

  @Authorize()
  @Post('list')
  @ApiOperation({ summary: '获取游戏列表' })
  @ApiCreatedResponse({ type: [AdminGameEntity] })
  @ApiErrorResponse(ClientGetGameListException)
  async list(
    @Query() query: MerchantGameListDTO,
    @Body() body: ClientGameIdsDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gameService.list(query, body, identity.merchantId);
  }

  @Authorize()
  @Post('invite_reward')
  @ApiOperation({ summary: '增加游戏邀请奖励' })
  @ApiErrorResponse(ClientGameInviteRewardException)
  async inviteReward(
    @Body() body: ClientGameInviteRewardDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gameService.inviteReward(body, identity);
  }

  @Authorize()
  @Get('list_by_prize')
  @ApiOperation({ summary: '根据奖品id，获取游戏列表' })
  @ApiOkResponse({ type: [ClientGameListByPrizeResp] })
  @ApiErrorResponse(ClientGetGameListException)
  async listByPrize(
    @Query() query: ClientGameListByPrizeDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gameService.listByPrize(query, identity.merchantId);
  }

  @Authorize()
  @Get('activity_list')
  @ApiOperation({ summary: '获取活动游戏列表' })
  @ApiOkResponse({ type: [AdminGameEntity] })
  @ApiErrorResponse(ClientGetGameListException)
  async activityList(
    @Query() query: MerchantGameListDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gameService.activityList(query, identity);
  }

  @Authorize()
  @Post('leave_word')
  @ApiOperation({ summary: '用户挑战结束留言' })
  @ApiErrorResponse(ClientGameLeaveWordException)
  async leaveWord(
    @Body() body: ClientGameLeaveWordDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gameService.leaveWord(body, identity);
  }

  @Authorize()
  @Get('ranking_list/:id')
  @ApiOperation({ summary: '获取游戏记录排名列表' })
  @ApiOkResponse({ type: [MerchantGameRankingEntity] })
  @ApiErrorResponse(ClientGetGameRankingListException)
  async rankingList(
    @Param() { id }: ClientGameIdDTO,
    @Query() { number }: ClientGameGetRankingDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gameService.rankingList(id, number, identity);
  }

  @Authorize()
  @Get('max_ranking/:id')
  @ApiOperation({ summary: '获取当前用户游戏最高挑战记录' })
  @ApiErrorResponse(ClientGetGameMaxRankingException)
  async maxRank(
    @Param() { id }: ClientGameIdDTO,
    @Identity() { merchantId, userId }: ClientIdentity,
  ) {
    return this.gameService.getUserGameMaxRanking(id, merchantId, userId);
  }

  @Authorize()
  @Get('qrcode/:id')
  @ApiOperation({ summary: '获取从当前游戏关注公众号的二维码' })
  @ApiErrorResponse(ClientGameGetQRCodeException)
  async qrcode(
    @Param() { id }: ClientGameIdDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.gameService.getGameQRCode(id, identity);
  }
}
