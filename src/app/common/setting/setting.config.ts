import { SettingKeyEnum } from './setting.enum';

export const settingDesc = Object.freeze({
  [SettingKeyEnum.RECHARGE]: '用户充值设置',
  [SettingKeyEnum.ORDER]: '订单流程设置',
  [SettingKeyEnum.POINTS]: '积分设置',
  [SettingKeyEnum.DELIVERY]: '运费设置',
  [SettingKeyEnum.WECHAT_OFFICIAL_ACCOUNT]: '微信公众号设置',
  [SettingKeyEnum.WECHAT_SUBSCRIBE_REPLY]: '微信公众号关注回复',
  [SettingKeyEnum.WECHAT_SCANCODE_REPLY]: '微信公众号扫码回复',
  [SettingKeyEnum.WECHAT_PAY]: '微信支付设置',
  [SettingKeyEnum.PAGE]: '客户端页面内容设置',
  [SettingKeyEnum.GAME_PRIZE]: '游戏奖品设置',
  [SettingKeyEnum.ATTENDANT]: '客服信息设置',
  [SettingKeyEnum.MENU_ORDER]: '点餐订单流程设置',
  [SettingKeyEnum.MENU_PAY_TYPE_LIST]: '点餐支付方式列表',
});
