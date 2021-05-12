import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import { WechatOfficialAccountService } from '@shared/wechat';
import { CommonTerminalEnum } from '@app/common/common.enum';
import { WechatSettingService } from '../setting';
import { WechatMenuDTO } from './menu.dto';
import { WechatSetMenuException } from './menu.exception';

@Injectable()
export class WechatMenuService extends BaseService {
  constructor(
    @Inject(WechatOfficialAccountService)
    private officialAccountService: WechatOfficialAccountService,
    @Inject(WechatSettingService)
    private wechatSettingService: WechatSettingService,
  ) {
    super();
  }

  /**
   * 获取微信公众号菜单
   * @param merchantId
   */
  async getMenus(target: CommonTerminalEnum, id: number) {
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      id,
    );
    const account = this.officialAccountService.getAccount(config);
    return account.menu.current();
  }

  /**
   * 设置微信公众号菜单
   * @param param0
   * @param merchantId
   */
  async setMenus(
    target: CommonTerminalEnum,
    id: number,
    { button }: WechatMenuDTO,
  ) {
    let menus = {};
    try {
      menus = JSON.parse(button);
    } catch (err) {
      throw new WechatSetMenuException({ msg: '请传入正确菜单数据' });
    }
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      id,
    );
    const account = this.officialAccountService.getAccount(config);
    return account.menu.create(menus);
  }
}
