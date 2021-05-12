import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiErrorResponse,
} from '@shared/swagger';
import { Controller, Inject, Get, Param } from '@nestjs/common';
import { ClientPageService } from './page.service';
import { Authorize, Identity } from '@core/decorator';
import { MerchantPageEntity, MerchantPageTypeEnum } from '@typeorm/meeluoShop';
import {
  ClientPageInfoException,
  ClientPageListException,
} from './page.exception';
import { ClientPageInfoDTO, ClientPageIdDTO } from './page.dto';

@ApiTags('客户端页面配置相关接口')
@Controller('client/page')
export class ClientPageController {
  constructor(
    @Inject(ClientPageService)
    private pageService: ClientPageService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取页面列表' })
  @ApiOkResponse({ type: [MerchantPageEntity] })
  @ApiErrorResponse(ClientPageListException)
  async list(@Identity() identity: ClientIdentity) {
    return this.pageService.list(identity);
  }

  @Authorize()
  @Get('info/app_index')
  @ApiOperation({ summary: '获取应用首页数据' })
  @ApiOkResponse({ type: ClientPageInfoDTO })
  @ApiErrorResponse(ClientPageInfoException)
  async appIndex(@Identity() identity: ClientIdentity) {
    return this.pageService.systemPageInfo(
      MerchantPageTypeEnum.INDEX,
      identity,
    );
  }

  @Authorize()
  @Get('info/game_index')
  @ApiOperation({ summary: '获取游戏首页数据' })
  @ApiOkResponse({ type: ClientPageInfoDTO })
  @ApiErrorResponse(ClientPageInfoException)
  async gameIndex(@Identity() identity: ClientIdentity) {
    return this.pageService.systemPageInfo(MerchantPageTypeEnum.GAME, identity);
  }

  @Authorize()
  @Get('info/shop_index')
  @ApiOperation({ summary: '获取商城首页数据' })
  @ApiOkResponse({ type: ClientPageInfoDTO })
  @ApiErrorResponse(ClientPageInfoException)
  async shopIndex(@Identity() identity: ClientIdentity) {
    return this.pageService.systemPageInfo(MerchantPageTypeEnum.SHOP, identity);
  }

  @Authorize()
  @Get('info/restaurant_index')
  @ApiOperation({ summary: '获取餐厅首页数据' })
  @ApiOkResponse({ type: ClientPageInfoDTO })
  @ApiErrorResponse(ClientPageInfoException)
  async restaurantIndex(@Identity() identity: ClientIdentity) {
    return this.pageService.systemPageInfo(
      MerchantPageTypeEnum.RESTAURANT,
      identity,
    );
  }

  @Authorize()
  @Get('info/custom/:pageId')
  @ApiOperation({ summary: '获取自定义页面数据' })
  @ApiOkResponse({ type: ClientPageIdDTO })
  @ApiErrorResponse(ClientPageInfoException)
  async custom(
    @Param() { pageId }: ClientPageIdDTO,
    @Identity() { merchantId }: ClientIdentity,
  ) {
    return this.pageService.pageInfo(pageId, merchantId);
  }
}
