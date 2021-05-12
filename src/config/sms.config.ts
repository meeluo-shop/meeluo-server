export default {
  templates: {
    VERIFICATION_CODE: '1390602107677065216', // 短信验证码
  },
  sendLimit: {
    userCount: 20, // 一个用户一天最多能调用20次发送短信接口
    mobileCount: 50, // 一个手机号，一天最多能收到50条短信
    verifyCount: 5, // 一个验证码最多验证5次，就需要重新发送
  },
};
