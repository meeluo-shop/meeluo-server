export default {
  wechatHtmlHost: 'http://h5.meeluo.com/index.html',
  paymentNotifyUrl: 'http://game.meeluo.com/api/common/wechat/callback/payment',
  industry: {
    primary: '1', // IT科技 - 互联网|电子商务
    secondary: '6', // IT科技 - 网络游戏
  },
  messageTemplate: {
    // 商品购买成功通知（发送给员工）
    buySuccess: {
      name: '购买成功通知',
      templateId: 'OPENTM409509200',
    },
    // 用户商城订单退款通知（发送给员工）
    cancelOrder: {
      name: '退款通知',
      templateId: 'OPENTM415964302',
    },
    // 商城订单发货通知（发送给用户）
    orderDelivery: {
      name: '订单发货通知',
      templateId: 'OPENTM414956350',
      redirectUrl: 'pages/order/detail/index',
    },
    // 奖品发货通知（发送给用户）
    winningDelivery: {
      name: '订单发货通知',
      templateId: 'OPENTM414956350',
      redirectUrl: 'pages/winning/detail/index',
    },
    // 商城订单退款成功（发送给用户）
    cancelOrderSuccess: {
      name: '退款成功通知',
      templateId: 'OPENTM410407050',
      redirectUrl: 'pages/order/detail/index',
    },
    // 商城订单退款失败（发送给用户）
    cancelOrderFail: {
      name: '退款失败提醒',
      templateId: 'OPENTM417954969',
      redirectUrl: 'pages/order/detail/index',
    },
    // 游戏界面关注公众号通知（发送给用户）
    subscribeGameSuccess: {
      name: '关注成功通知',
      templateId: 'OPENTM405896778',
      redirectUrl: 'pages/game/detail/index',
    },
    // 商户界面关注公众号通知（发送给用户）
    subscribeMerchantSuccess: {
      name: '关注成功通知',
      templateId: 'OPENTM405896778',
      redirectUrl: 'pages/auth/index/index',
    },
    // 获奖通知（发送给员工）
    winningNotifyStaff: {
      name: '中奖结果通知',
      templateId: 'OPENTM412546598',
    },
    // 获奖通知（发送给用户）
    winningNotifyUser: {
      name: '中奖结果通知',
      templateId: 'OPENTM412546598',
      redirectUrl: 'pages/winning/detail/index',
    },
    // 点餐成功通知（发送给员工）
    submitMenuNotifyStaff: {
      name: '点餐成功通知',
      templateId: 'OPENTM414274085',
      redirectUrl: 'pages/restaurant/menu/order/detail/index',
    },
    // 餐后付款成功通知（发送给员工）
    menuPayNotifyStaff: {
      name: '付款成功通知',
      templateId: 'OPENTM416738152',
      redirectUrl: 'pages/restaurant/menu/order/detail/index',
    },
    // 点餐订单退款通知（发送给员工）
    cancelMenuOrder: {
      name: '退款通知',
      templateId: 'OPENTM415964302',
      redirectUrl: 'pages/restaurant/menu/order/detail/index',
    },
    // 点餐订单退款成功通知（发送给用户）
    cancelMenuOrderSuccess: {
      name: '退款成功通知',
      templateId: 'OPENTM410407050',
      redirectUrl: 'pages/restaurant/menu/order/detail/index',
    },
    // 点餐订单退款失败通知（发送给用户）
    cancelMenuOrderFail: {
      name: '退款失败提醒',
      templateId: 'OPENTM417954969',
      redirectUrl: 'pages/restaurant/menu/order/detail/index',
    },
  },
};
