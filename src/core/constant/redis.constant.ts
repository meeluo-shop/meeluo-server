// 系统后台用户登陆token
export const ADMIN_JWT_LOGIN_DATA_PREFIX = 'admin:jwt:';
// 代理商用户登陆token
export const AGENT_JWT_LOGIN_DATA_PREFIX = 'agent:jwt:';
// 商户员工登陆token
export const MERCHANT_JWT_LOGIN_DATA_PREFIX = 'merchant:jwt:';
// 商户点餐排号
export const MERCHANT_RESTAURANT_NO_PREFIX = 'merchant:restaurant_no:';
// 商户员工信息被修改标记
export const MERCHANT_STAFF_CHANGED_PREFIX = 'merchant:staff:changed:';
// 微信客户端登陆token
export const CLIENT_JWT_LOGIN_DATA_PREFIX = 'client:jwt:';
// 用户信息被修改标记
export const CLIENT_USER_CHANGED_PREFIX = 'client:user:changed:';
// 用户提交微信支付订单，缓存的订单交易号
export const CLIENT_USER_WECHAT_TRADE_NO = 'client:user:wechat_trade_no:';
// 用户参与游戏，生成的会话
export const ADMIN_GAME_USER_SESSION_PREFIX = 'admin:game:user:session:';
// 用户参与赢奖游戏，拥有的免费次数
export const CLIENT_GAME_ACTIVITY_USER_FREE_NUM_PREFIX =
  'client:game:activity:free_num:';
// 用户提交订单时生成的锁，避免用户同时提交多个订单
export const CLIENT_ORDER_PAY_LOCK_PREFIX = 'client:order:pay_lock';
// 用户每日游戏获奖次数
export const CLIENT_USER_GAME_WINNING_COUNT = 'client:user:game_winning_count';
// 微信用户扫码餐桌二维码，缓存餐桌id
export const CLIENT_USER_TABLE_ID = 'client:user:table_id';
// 缓存用户发送短信状态，间隔一段时间后删除，才可继续发送
export const CLIENT_USER_SEND_SMS_TIMEOUT = 'client:user:send_sms_timeout';
// 缓存用户当天发送短信数量
export const CLIENT_USER_SEND_SMS_COUNT = 'client:user:send_sms_count';
// 缓存手机号当天发送短信数量
export const CLIENT_PHONE_SEND_SMS_COUNT = 'client:phone:send_sms_count';
// 缓存手机号验证码验证失败次数
export const CLIENT_PHONE_VERIFY_FAILED_COUNT =
  'client:phone:verify_failed_count';
