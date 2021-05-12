import * as QS from 'querystring';
import * as moment from 'moment';
import { BaseService } from '@app/app.service';
import { Inject, Injectable } from '@nestjs/common';
// 建议通过装饰器读取配置，主要为了后期接nacos配置中心时，支持从远程拉取配置
import WechatConfig from '@config/wechat.config';
import {
  InjectService,
  Not,
  IsNull,
  FindConditions,
} from '@jiaxinjiang/nest-orm';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';
import {
  WechatMessageTemplateEntity,
  MerchantOrderPayTypeEnum,
  MerchantStaffEntity,
  MerchantStaffIsActiveEnum,
  MerchantEntity,
  MerchantAllowPrivateWechatEnum,
  MerchantMenuOrderPayTypeEnum,
  MerchantMenuOrderPayStatusEnum,
} from '@typeorm/meeluoShop';
import { WechatOfficialAccountService } from '@shared/wechat';
import { OrmService } from '@typeorm/orm.service';
import { WechatOfficialAccountSettingDTO } from '@app/common/wechat/setting';
import { MerchantWechatService } from '../wechat.service';

@Injectable()
export class MerchantWechatTemplateService extends BaseService {
  constructor(
    @Inject(MerchantWechatService)
    private merchantWechatService: MerchantWechatService,
    @Inject(WechatOfficialAccountService)
    private officialAccountService: WechatOfficialAccountService,
    @InjectLogger(MerchantWechatTemplateService)
    private logger: LoggerProvider,
    @InjectService(MerchantEntity)
    private merchantEntityService: OrmService<MerchantEntity>,
    @InjectService(MerchantStaffEntity)
    private staffEntityService: OrmService<MerchantStaffEntity>,
    @InjectService(WechatMessageTemplateEntity)
    private messageTemplateEntityService: OrmService<
      WechatMessageTemplateEntity
    >,
  ) {
    super();
  }

  /**
   * 生成跳转微信h5地址
   * @param url
   * @param merchantId
   * @param params
   */
  getRedirectUrl(url: string, merchantId: number, params: object = {}) {
    const { wechatHtmlHost } = WechatConfig;
    const query = QS.stringify({ ...params, merchantId });
    return url ? `${wechatHtmlHost}#/${url}?${query}` : null;
  }

  /**
   * 获取模板信息和微信配置
   * @param param0
   */
  async getTemplateInfoAndConfig({
    merchantId,
    templateId,
  }: {
    merchantId: number;
    templateId: string;
  }) {
    const merchant = await this.merchantEntityService.findById(merchantId, {
      select: ['allowPrivateWechat', 'agentId'],
    });
    const config = await this.merchantWechatService.getOfficialAccountConfig(
      merchantId,
      merchant,
    );
    const condition: FindConditions<WechatMessageTemplateEntity> = {
      appid: config.appId,
      templateShortId: templateId,
    };
    if (merchant.allowPrivateWechat === MerchantAllowPrivateWechatEnum.FALSE) {
      condition.agentId = merchant.agentId;
    } else {
      condition.merchantId = merchant.id;
    }
    const template = await this.messageTemplateEntityService.findOne({
      select: ['templateId'],
      where: condition,
    });
    return { template, config };
  }

  /**
   * 获取已绑定微信用户的商户员工列表
   */
  async getMerchantStaffList(merchantId: number) {
    return this.staffEntityService.find({
      select: ['openid'],
      where: {
        merchantId,
        isActive: MerchantStaffIsActiveEnum.TRUE,
        openid: Not(IsNull()),
      },
    });
  }

  /**
   * 给商户员工发送用户获奖通知
   * @param notice
   * @param merchantId
   */
  async sendWinningStaffNotice(
    notice: {
      username: string;
      gameName: string;
      prizeName: string;
      winningTime: Date;
      winningNo: string;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { templateId } = messageTemplate.winningNotifyStaff;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    // 获取已经绑定了微信用户的员工列表
    const staffList = await this.getMerchantStaffList(merchantId);
    const messageList: Array<{
      openid: string;
      templateId: string;
      url?: string;
      data: object;
    }> = [];
    staffList.forEach(staff => {
      messageList.push({
        openid: staff.openid,
        templateId: template?.templateId,
        data: {
          first: {
            value: `用户（${notice.username}）参与游戏挑战活动获得奖品，请尽快发货`,
          },
          keyword1: {
            value: notice.gameName,
          },
          keyword2: {
            value: notice.prizeName,
          },
          keyword3: {
            value: moment(notice.winningTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
          remark: {
            value: `获奖订单：${notice.winningNo}`,
          },
        },
      });
    });
    await Promise.all(
      messageList.map(message => this.sendTemplateMessage(message, config)),
    );
    return true;
  }

  /**
   * 通知用户获奖
   */
  async sendWinningUserNotice(
    notice: {
      openid: string;
      gameName: string;
      prizeName: string;
      winningTime: Date;
      winningId: number;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { redirectUrl, templateId } = messageTemplate.winningNotifyUser;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    return this.sendTemplateMessage(
      {
        openid: notice.openid,
        templateId: template.templateId,
        url: this.getRedirectUrl(redirectUrl, merchantId, {
          id: notice.winningId,
        }),
        data: {
          first: {
            value: `恭喜您参与游戏挑战活动，并成功获得奖品！`,
          },
          keyword1: {
            value: notice.gameName,
          },
          keyword2: {
            value: notice.prizeName,
          },
          keyword3: {
            value: moment(notice.winningTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
          remark: {
            value: `点击详情，去确认奖品吧！`,
          },
        },
      },
      config,
    );
  }

  /**
   * 游戏界面关注公众号通知
   * @param notice
   * @param merchantId
   */
  async sendSubscribeGameNotice(
    notice: {
      openid: string;
      username: string;
      subscribeTime: Date;
      playNum: number;
      gameId: number;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { redirectUrl, templateId } = messageTemplate.subscribeGameSuccess;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    return this.sendTemplateMessage(
      {
        openid: notice.openid,
        templateId: template.templateId,
        url: this.getRedirectUrl(redirectUrl, merchantId, {
          id: notice.gameId,
        }),
        data: {
          first: {
            value: `恭喜您成功获得${notice.playNum}次挑战机会！`,
          },
          keyword1: {
            value: notice.username,
          },
          keyword2: {
            value: moment(notice.subscribeTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
          remark: {
            value: `点击详情，立即进入游戏`,
          },
        },
      },
      config,
    );
  }

  /**
   * 给用户发送奖品发货通知
   * @param notice
   * @param openid
   * @param merchantId
   */
  async sendWinningDeliveryNotice(
    notice: {
      openid: string;
      winningNo: string;
      deliveryTime: Date;
      expressCompany: string;
      expressNo: string;
      address: string;
      goodsName: string;
      winningId: number;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { redirectUrl, templateId } = messageTemplate.winningDelivery;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    return this.sendTemplateMessage(
      {
        openid: notice.openid,
        templateId: template.templateId,
        url: this.getRedirectUrl(redirectUrl, merchantId, {
          id: notice.winningId,
        }),
        data: {
          first: {
            value: `您的奖品已发货，请待查收！`,
          },
          keyword1: {
            value: notice.winningNo,
          },
          keyword2: {
            value: moment(notice.deliveryTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
          keyword3: {
            value: notice.expressCompany,
          },
          keyword4: {
            value: notice.expressNo,
          },
          keyword5: {
            value: notice.address,
          },
          remark: {
            value: `奖品名称：${notice.goodsName}`,
          },
        },
      },
      config,
    );
  }

  /**
   * 给用户发送订单发货通知
   * @param notice
   * @param openid
   * @param merchantId
   */
  async sendOrderDeliveryNotice(
    notice: {
      openid: string;
      orderNo: string;
      deliveryTime: Date;
      expressCompany: string;
      expressNo: string;
      address: string;
      goodsName: string;
      orderId: number;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { redirectUrl, templateId } = messageTemplate.orderDelivery;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    return this.sendTemplateMessage(
      {
        openid: notice.openid,
        templateId: template.templateId,
        url: this.getRedirectUrl(redirectUrl, merchantId, {
          id: notice.orderId,
        }),
        data: {
          first: {
            value: `您购买的商品已发货，请待查收！`,
          },
          keyword1: {
            value: notice.orderNo,
          },
          keyword2: {
            value: moment(notice.deliveryTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
          keyword3: {
            value: notice.expressCompany,
          },
          keyword4: {
            value: notice.expressNo,
          },
          keyword5: {
            value: notice.address,
          },
          remark: {
            value: `商品名称：${notice.goodsName}`,
          },
        },
      },
      config,
    );
  }

  /**
   * 给用户发送退款成功通知
   * @param notice
   * @param openid
   * @param merchantId
   */
  async sendCancelOrderSuccessNotice(
    notice: {
      openid: string;
      orderNo: string;
      refundTime: Date;
      merchantName: string;
      refundType: MerchantOrderPayTypeEnum | MerchantMenuOrderPayTypeEnum;
      amount: number;
      orderId: number;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { redirectUrl, templateId } = messageTemplate.cancelOrderSuccess;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    const getRefundType = (
      refundType: MerchantOrderPayTypeEnum | MerchantMenuOrderPayTypeEnum,
    ) => {
      switch (refundType) {
        case MerchantOrderPayTypeEnum.BALANCE:
          return '账户余额';
        case MerchantOrderPayTypeEnum.WECHAT:
          return '微信账户';
        default:
          return '账户余额';
      }
    };
    return this.sendTemplateMessage(
      {
        openid: notice.openid,
        templateId: template.templateId,
        url: this.getRedirectUrl(redirectUrl, merchantId, {
          id: notice.orderId,
        }),
        data: {
          first: {
            value: `您申请的退款订单已完成，请检查退还金额`,
          },
          keyword1: {
            value: notice.orderNo,
          },
          keyword2: {
            value: notice.merchantName,
          },
          keyword3: {
            value: getRefundType(notice.refundType),
          },
          keyword4: {
            value: '¥ ' + notice.amount,
          },
          keyword5: {
            value: moment(notice.refundTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
        },
      },
      config,
    );
  }

  /**
   * 给用户发送退款失败通知
   * @param notice
   * @param openid
   * @param merchantId
   */
  async sendCancelOrderFailNotice(
    notice: {
      openid: string;
      orderNo: string;
      refundTime: Date;
      merchantName: string;
      amount: number;
      orderId: number;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { redirectUrl, templateId } = messageTemplate.cancelOrderFail;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    return this.sendTemplateMessage(
      {
        openid: notice.openid,
        templateId: template.templateId,
        url: this.getRedirectUrl(redirectUrl, merchantId, {
          id: notice.orderId,
        }),
        data: {
          first: {
            value: `您申请的退款订单已被拒绝，如有疑问请联系客服人员`,
          },
          keyword1: {
            value: notice.merchantName,
          },
          keyword2: {
            value: notice.orderNo,
          },
          keyword3: {
            value: '¥ ' + notice.amount,
          },
          keyword4: {
            value: moment(notice.refundTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
        },
      },
      config,
    );
  }

  /**
   * 给门店员工发送商品购买成功通知
   * @param openidList
   * @param params
   * @param merchantId
   */
  async sendBuySuccessNotice(
    noticeList: Array<{
      username: string;
      goodsName: string;
      payTime: Date;
      amount: number;
      payType: MerchantOrderPayTypeEnum | MerchantMenuOrderPayTypeEnum;
      merchantName: string;
    }>,
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { templateId } = messageTemplate.buySuccess;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    // 获取已经绑定了微信用户的员工列表
    const staffList = await this.getMerchantStaffList(merchantId);
    const getPayType = (
      payType: MerchantOrderPayTypeEnum | MerchantMenuOrderPayTypeEnum,
    ) => {
      switch (payType) {
        case MerchantOrderPayTypeEnum.BALANCE:
          return '余额支付';
        case MerchantOrderPayTypeEnum.WECHAT:
          return '微信支付';
        default:
          return '异常支付';
      }
    };
    const messageList: Array<{
      openid: string;
      templateId: string;
      url?: string;
      data: object;
    }> = [];
    noticeList.forEach(notice => {
      staffList.forEach(staff => {
        messageList.push({
          openid: staff.openid,
          templateId: template?.templateId,
          data: {
            first: {
              value: `用户（${notice.username}）已成功购买商品`,
            },
            keyword1: {
              value: moment(notice.payTime)
                .locale('zh-cn')
                .format('YYYY-MM-DD HH:mm:ss'),
            },
            keyword2: {
              value: notice.goodsName,
            },
            keyword3: {
              value: '¥ ' + notice.amount,
            },
            keyword4: {
              value: getPayType(notice.payType),
            },
            keyword5: {
              value: notice.merchantName,
            },
            remark: {
              value: '快去给用户发货吧！',
            },
          },
        });
      });
    });
    await Promise.all(
      messageList.map(message => this.sendTemplateMessage(message, config)),
    );
    return true;
  }

  /**
   * 给门店员工发送申请商城订单退款通知
   * @param openidList
   * @param params
   * @param merchantId
   */
  async sendCancelOrderApplyNotice(
    notice: {
      orderNo: string;
      username: string;
      refundTime: Date;
      amount: number;
      refundType: MerchantOrderPayTypeEnum | MerchantMenuOrderPayTypeEnum;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { templateId } = messageTemplate.cancelOrder;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    // 获取已经绑定了微信用户的员工列表
    const staffList = await this.getMerchantStaffList(merchantId);
    const getRefundType = (
      refundType: MerchantOrderPayTypeEnum | MerchantMenuOrderPayTypeEnum,
    ) => {
      switch (refundType) {
        case MerchantOrderPayTypeEnum.BALANCE:
          return '账户余额';
        case MerchantOrderPayTypeEnum.WECHAT:
          return '微信账户';
        default:
          return '账户余额';
      }
    };
    const messageList: Array<{
      openid: string;
      templateId: string;
      url?: string;
      data: object;
    }> = [];
    staffList.forEach(staff => {
      messageList.push({
        openid: staff.openid,
        templateId: template?.templateId,
        data: {
          first: {
            value: `用户（${notice.username}）申请了订单退款，请尽快审批！`,
          },
          keyword1: {
            value: '¥ ' + notice.amount,
          },
          keyword2: {
            value: '无',
          },
          keyword3: {
            value: moment(notice.refundTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
          keyword4: {
            value: getRefundType(notice.refundType),
          },
          keyword5: {
            value: '请进入管理后台进行审核！',
          },
          remark: {
            value: `订单号：${notice.orderNo}`,
          },
        },
      });
    });
    await Promise.all(
      messageList.map(message => this.sendTemplateMessage(message, config)),
    );
    return true;
  }

  /**
   * 给员工发送点餐下单成功通知
   * @param notice
   * @param merchantId
   */
  async sendSubmitMenuNotify(
    notice: {
      orderId: number;
      rowNo: number;
      orderNo: string;
      people: number;
      orderTime: Date;
      tableName: string;
      price: number;
      payType: MerchantMenuOrderPayTypeEnum;
      payStatus: MerchantMenuOrderPayStatusEnum;
      menus: string;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { templateId, redirectUrl } = messageTemplate.submitMenuNotifyStaff;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    // 获取已经绑定了微信用户的员工列表
    const staffList = await this.getMerchantStaffList(merchantId);
    const getRefundType = (
      payType: MerchantMenuOrderPayTypeEnum,
      payStatus: MerchantMenuOrderPayStatusEnum,
    ) => {
      if (payStatus === MerchantMenuOrderPayStatusEnum.OFFLINE_PAY) {
        return '餐后支付';
      }
      switch (payType) {
        case MerchantMenuOrderPayTypeEnum.BALANCE:
          return '余额支付';
        case MerchantMenuOrderPayTypeEnum.WECHAT:
          return '微信支付';
        default:
          return '异常支付';
      }
    };
    const messageList: Array<{
      openid: string;
      templateId: string;
      url?: string;
      data: object;
    }> = [];
    staffList.forEach(staff => {
      messageList.push({
        openid: staff.openid,
        templateId: template.templateId,
        url: this.getRedirectUrl(redirectUrl, merchantId, {
          id: notice.orderId,
          isStaff: 1,
        }),
        data: {
          first: {
            value: `“${notice.tableName}”顾客成功下单，请尽快上餐！`,
          },
          keyword1: {
            value: getRefundType(notice.payType, notice.payStatus),
          },
          keyword2: {
            value: notice.orderNo,
          },
          keyword3: {
            value: moment(notice.orderTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
          keyword4: {
            value: `${notice.tableName}（${notice.people}人）`,
          },
          keyword5: {
            value: notice.menus,
          },
          remark: {
            value: `订单金额：¥ ${notice.price}`,
          },
        },
      });
    });
    await Promise.all(
      messageList.map(message => this.sendTemplateMessage(message, config)),
    );
    return true;
  }

  /**
   * 给员工发送餐后付款成功通知
   * @param notice
   * @param merchantId
   */
  async sendMenuPayNotifyStaff(
    notice: {
      orderId: number;
      rowNo: number;
      orderNo: string;
      people: number;
      orderTime: Date;
      tableName: string;
      price: number;
      payType: MerchantMenuOrderPayTypeEnum;
      payStatus: MerchantMenuOrderPayStatusEnum;
      menus: string;
      surplusOrderNum: number;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { templateId, redirectUrl } = messageTemplate.menuPayNotifyStaff;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    // 获取已经绑定了微信用户的员工列表
    const staffList = await this.getMerchantStaffList(merchantId);
    const getRefundType = (
      payType: MerchantMenuOrderPayTypeEnum,
      payStatus: MerchantMenuOrderPayStatusEnum,
    ) => {
      if (payStatus === MerchantMenuOrderPayStatusEnum.OFFLINE_PAY) {
        return '餐后支付';
      }
      switch (payType) {
        case MerchantMenuOrderPayTypeEnum.BALANCE:
          return '余额支付';
        case MerchantMenuOrderPayTypeEnum.WECHAT:
          return '微信支付';
        default:
          return '异常支付';
      }
    };
    const messageList: Array<{
      openid: string;
      templateId: string;
      url?: string;
      data: object;
    }> = [];
    staffList.forEach(staff => {
      messageList.push({
        openid: staff.openid,
        templateId: template.templateId,
        url: this.getRedirectUrl(redirectUrl, merchantId, {
          id: notice.orderId,
          isStaff: 1,
        }),
        data: {
          first: {
            value: `“${notice.tableName}”顾客已支付${notice.price}元，当前餐桌剩余未支付订单（${notice.surplusOrderNum}份）`,
          },
          keyword1: {
            value: notice.orderNo,
          },
          keyword2: {
            value: moment(notice.orderTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
          keyword3: {
            value: `${notice.tableName}（${notice.people}人）`,
          },
          keyword4: {
            value: notice.menus,
          },
          remark: {
            value: `支付类型：${getRefundType(
              notice.payType,
              notice.payStatus,
            )}`,
          },
        },
      });
    });
    await Promise.all(
      messageList.map(message => this.sendTemplateMessage(message, config)),
    );
    return true;
  }

  /**
   * 给门店员工发送申请点餐订单退款通知
   * @param openidList
   * @param params
   * @param merchantId
   */
  async sendCancelMenuOrderApplyNotice(
    notice: {
      orderId: number;
      orderNo: string;
      username: string;
      refundTime: Date;
      amount: number;
      refundType: MerchantOrderPayTypeEnum | MerchantMenuOrderPayTypeEnum;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { templateId, redirectUrl } = messageTemplate.cancelMenuOrder;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    // 获取已经绑定了微信用户的员工列表
    const staffList = await this.getMerchantStaffList(merchantId);
    const getRefundType = (
      refundType: MerchantOrderPayTypeEnum | MerchantMenuOrderPayTypeEnum,
    ) => {
      switch (refundType) {
        case MerchantOrderPayTypeEnum.BALANCE:
          return '账户余额';
        case MerchantOrderPayTypeEnum.WECHAT:
          return '微信账户';
        default:
          return '账户余额';
      }
    };
    const messageList: Array<{
      openid: string;
      templateId: string;
      url?: string;
      data: object;
    }> = [];
    staffList.forEach(staff => {
      messageList.push({
        openid: staff.openid,
        templateId: template?.templateId,
        url: this.getRedirectUrl(redirectUrl, merchantId, {
          id: notice.orderId,
          isStaff: 1,
        }),
        data: {
          first: {
            value: `用户（${notice.username}）申请了订单退款，请尽快审批！`,
          },
          keyword1: {
            value: '¥ ' + notice.amount,
          },
          keyword2: {
            value: '无',
          },
          keyword3: {
            value: moment(notice.refundTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
          keyword4: {
            value: getRefundType(notice.refundType),
          },
          keyword5: {
            value: `订单号：${notice.orderNo}`,
          },
        },
      });
    });
    await Promise.all(
      messageList.map(message => this.sendTemplateMessage(message, config)),
    );
    return true;
  }

  /**
   * 给用户发送点餐订单退款成功通知
   * @param notice
   * @param openid
   * @param merchantId
   */
  async sendCancelMenuOrderSuccessNotice(
    notice: {
      openid: string;
      orderNo: string;
      refundTime: Date;
      merchantName: string;
      refundType: MerchantOrderPayTypeEnum | MerchantMenuOrderPayTypeEnum;
      amount: number;
      orderId: number;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { redirectUrl, templateId } = messageTemplate.cancelMenuOrderSuccess;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    const getRefundType = (
      refundType: MerchantOrderPayTypeEnum | MerchantMenuOrderPayTypeEnum,
    ) => {
      switch (refundType) {
        case MerchantOrderPayTypeEnum.BALANCE:
          return '账户余额';
        case MerchantOrderPayTypeEnum.WECHAT:
          return '微信账户';
        default:
          return '账户余额';
      }
    };
    return this.sendTemplateMessage(
      {
        openid: notice.openid,
        templateId: template.templateId,
        url: this.getRedirectUrl(redirectUrl, merchantId, {
          id: notice.orderId,
          isStaff: 1,
        }),
        data: {
          first: {
            value: `您申请的退款订单已完成，请检查退还金额`,
          },
          keyword1: {
            value: notice.orderNo,
          },
          keyword2: {
            value: notice.merchantName,
          },
          keyword3: {
            value: getRefundType(notice.refundType),
          },
          keyword4: {
            value: '¥ ' + notice.amount,
          },
          keyword5: {
            value: moment(notice.refundTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
        },
      },
      config,
    );
  }

  /**
   * 给用户发送点餐订单退款失败通知
   * @param notice
   * @param openid
   * @param merchantId
   */
  async sendCancelMenuOrderFailNotice(
    notice: {
      openid: string;
      orderNo: string;
      refundTime: Date;
      merchantName: string;
      amount: number;
      orderId: number;
    },
    merchantId: number,
  ) {
    const { messageTemplate } = WechatConfig;
    const { redirectUrl, templateId } = messageTemplate.cancelMenuOrderFail;
    const { config, template } = await this.getTemplateInfoAndConfig({
      templateId,
      merchantId,
    });
    return this.sendTemplateMessage(
      {
        openid: notice.openid,
        templateId: template.templateId,
        url: this.getRedirectUrl(redirectUrl, merchantId, {
          id: notice.orderId,
          isStaff: 1,
        }),
        data: {
          first: {
            value: `您申请的退款订单已被拒绝，如有疑问请联系客服人员`,
          },
          keyword1: {
            value: notice.merchantName,
          },
          keyword2: {
            value: notice.orderNo,
          },
          keyword3: {
            value: '¥ ' + notice.amount,
          },
          keyword4: {
            value: moment(notice.refundTime)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
        },
      },
      config,
    );
  }

  /**
   * 发送模板消息
   * @param param0
   */
  async sendTemplateMessage(
    params: {
      openid: string;
      templateId: string;
      url?: string;
      data: object;
    },
    config: WechatOfficialAccountSettingDTO,
  ) {
    const { openid, templateId, url, data } = params;
    const account = this.officialAccountService.getAccount(config);
    try {
      await account.templateMessage.send({
        touser: openid,
        templateId,
        url,
        data,
      });
    } catch (err) {
      this.logger.error(err);
      return false;
    }
    return true;
  }
}
