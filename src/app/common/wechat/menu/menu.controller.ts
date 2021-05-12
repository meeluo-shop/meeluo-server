import { Authorize, Identity } from '@core/decorator';
import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import {
  WechatGetMenuException,
  WechatSetMenuException,
} from './menu.exception';
import { CommonService } from '@app/common/common.service';
import { WechatMenuService } from './menu.service';
import { MenuListResp, WechatMenuDTO } from './menu.dto';

@ApiTags('微信自定义菜单相关接口')
@Controller('common/wechat/menu')
export class WechatMenuController {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatMenuService)
    private menuService: WechatMenuService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取微信公众号自定义菜单' })
  @ApiOkResponse({ type: MenuListResp })
  @ApiErrorResponse(WechatGetMenuException)
  async list(@Identity() identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    return this.menuService.getMenus(terminal.target, terminal.id);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '设置微信公众号自定义菜单' })
  @ApiErrorResponse(WechatSetMenuException)
  async create(
    @Body() body: WechatMenuDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.menuService.setMenus(terminal.target, terminal.id, body);
  }
}
