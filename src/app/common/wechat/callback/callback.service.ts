import * as QS from 'querystring';
import * as CryptoJs from 'crypto-js';
// 建议通过装饰器读取配置，主要为了后期接nacos配置中心时，支持从远程拉取配置
import WechatConfig from '@config/wechat.config';
import { FastifyReply } from 'fastify';
import { BaseService } from '@app/app.service';
import { Inject, Injectable } from '@nestjs/common';
import { MerchantGameActivityService } from '@app/merchant/game/activity';
import {
  WechatCallbackParamDTO,
  WechatNotifyCheckSignDTO,
  WechatNotifyCallbackDTO,
  WechatMessageTypeEnum,
  WechatEventTypeEnum,
} from './callback.dto';
import {
  WechatOfficialAccountSettingDTO,
  WechatSettingService,
} from '../setting';
import { QRCodeSceneEnum, QRCodeSceneValue } from '../qrcode';
import { MerchantWechatTemplateService } from '@app/merchant/wechat/template';
import { Case, switchHandler } from '@shared/helper';
import {
  MerchantGameEntity,
  MerchantUserEntity,
  WechatUserEntity,
  WechatUserSubscribedGameEnum,
  WechatUserSubscribeEnum,
  MerchantGameActivityEntity,
  WechatKeywordEntity,
  WechatKeywordMsgTypeEnum,
  WechatMaterialEntity,
  WechatKeywordIsActiveEnum,
  MerchantTableEntity,
} from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { WechatReplySubscribeResp } from '../reply/subscribe';
import { InjectService } from '@jiaxinjiang/nest-orm';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';
import { WechatReplySubscribeService } from '../reply/subscribe';
import { WechatReplyScanCodeService } from '../reply/scancode';
import { CommonTerminalEnum } from '@app/common/common.enum';
import { CommonService } from '@app/common/common.service';
import { WechatAuthSnsApiTypeEnum } from '@library/easyWechat/OfficialAccount/OAuth/OAuthClient';
import { MerchantTableService } from '@app/merchant/table';

export interface HandleEventParam {
  response: FastifyReply;
  notifyData: WechatNotifyCallbackDTO;
  terminalId: number;
  terminalType: CommonTerminalEnum;
  officialAccountConfig: WechatOfficialAccountSettingDTO;
}

@Injectable()
export class WechatCallbackService extends BaseService {
  constructor(
    @InjectLogger(WechatCallbackService)
    private logger: LoggerProvider,
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatSettingService)
    private wechatSettingService: WechatSettingService,
    @Inject(MerchantGameActivityService)
    private gameActivityService: MerchantGameActivityService,
    @Inject(MerchantTableService)
    private merchantTableService: MerchantTableService,
    @Inject(MerchantWechatTemplateService)
    private wechatTemplateService: MerchantWechatTemplateService,
    @Inject(WechatReplySubscribeService)
    private wechatSubscribeService: WechatReplySubscribeService,
    @Inject(WechatReplyScanCodeService)
    private wechatScanCodeService: WechatReplyScanCodeService,
    @InjectService(WechatUserEntity)
    private wechatUserEntityService: OrmService<WechatUserEntity>,
    @InjectService(MerchantUserEntity)
    private merchantUserEntityService: OrmService<MerchantUserEntity>,
    @InjectService(MerchantGameEntity)
    private gameEntityService: OrmService<MerchantGameEntity>,
    @InjectService(WechatMaterialEntity)
    private materialEntityService: OrmService<WechatMaterialEntity>,
    @InjectService(MerchantTableEntity)
    private tableEntityService: OrmService<MerchantTableEntity>,
    @InjectService(WechatKeywordEntity)
    private keywordEntityService: OrmService<WechatKeywordEntity>,
    @InjectService(MerchantGameActivityEntity)
    private gameActivityEntityService: OrmService<MerchantGameActivityEntity>,
  ) {
    super();
  }

  getWechatAuthUrl(
    appId: string,
    merchantId: number,
    snsApi: WechatAuthSnsApiTypeEnum = WechatAuthSnsApiTypeEnum.BASE,
  ) {
    const params: QS.ParsedUrlQueryInput = {
      merchantId,
      target: 'user',
    };
    if (snsApi === WechatAuthSnsApiTypeEnum.BASE) {
      params.base = 1;
    }
    const query = QS.stringify(params);
    const callbackUrl = encodeURIComponent(
      `${
        WechatConfig.wechatHtmlHost
      }?timestamp=${Date.now()}#/pages/auth/callback/index?${query}`,
    );
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${callbackUrl}&response_type=code&scope=${snsApi}&state=123#wechat_redirect`;
  }

  getWechatAppUrl(path: string, params: QS.ParsedUrlQueryInput = {}) {
    const query = QS.stringify(params);
    const fullQuery = query ? `?${query}` : '';
    return `${
      WechatConfig.wechatHtmlHost
    }?timestamp=${Date.now()}#/${path}${fullQuery}`;
  }

  /**
   * 校验微信服务器签名
   * @param merchantId
   * @param param1
   */
  async validateSign(
    { id, type }: WechatCallbackParamDTO,
    { echostr, signature, timestamp, nonce }: WechatNotifyCheckSignDTO,
    officialAccountConfig?: WechatOfficialAccountSettingDTO,
  ) {
    if (!officialAccountConfig) {
      officialAccountConfig = await this.wechatSettingService.getOfficialAccount(
        type,
        id,
      );
    }
    const str = [officialAccountConfig.token, timestamp, nonce].sort().join('');
    const encodeStr = CryptoJs.SHA1(str).toString();
    return encodeStr === signature ? (echostr ? echostr : true) : false;
  }

  /**
   * 处理微信消息
   * @param response
   * @param merchantId
   * @param body
   * @param query
   */
  async replyMessage({
    param,
    response,
    notifyData,
    signData,
  }: {
    response: FastifyReply;
    param: WechatCallbackParamDTO;
    notifyData: WechatNotifyCallbackDTO;
    signData: WechatNotifyCheckSignDTO;
  }) {
    const { id: terminalId, type: terminalType } = param;
    const officialAccountConfig = await this.wechatSettingService.getOfficialAccount(
      terminalType,
      terminalId,
    );
    // 校验签名
    const isVerify = await this.validateSign(
      param,
      signData,
      officialAccountConfig,
    );
    if (!isVerify) {
      this.replyTextMessage(
        response,
        notifyData.fromUserName,
        officialAccountConfig.wechatId,
        '微信签名验证失败',
      );
      return;
    }
    if (notifyData.msgType === WechatMessageTypeEnum.EVENT) {
      // 处理微信事件消息
      await switchHandler<(param: HandleEventParam) => void>(
        this,
        notifyData.event,
        () => response.send('success'),
      )({
        response,
        notifyData,
        terminalId,
        terminalType,
        officialAccountConfig,
      });
    } else if (notifyData.msgType === WechatMessageTypeEnum.TEXT) {
      // 处理关键字回复
      await this.keywordReply({
        response,
        notifyData,
        terminalId,
        terminalType,
        officialAccountConfig,
      });
    } else {
      // 将其他消息转发给微信客服系统
      await this.transferCustomerService(
        response,
        notifyData.fromUserName,
        officialAccountConfig.wechatId,
      );
    }
  }

  /**
   * 处理关键字回复
   * @param param0
   */
  async keywordReply({
    response,
    notifyData,
    officialAccountConfig,
    terminalType,
    terminalId,
  }: HandleEventParam) {
    const condition = this.commonService.getTerminalCondition(
      terminalType,
      terminalId,
    );
    const keywordEntity = await this.keywordEntityService.findOne({
      where: {
        ...condition,
        appid: officialAccountConfig.appId,
        keyword: notifyData.content || notifyData.eventKey,
        isActive: WechatKeywordIsActiveEnum.TRUE,
      },
    });
    // 根据消息类型返回不同的内容
    await this.replyByMsgType(
      keywordEntity,
      response,
      notifyData.fromUserName,
      officialAccountConfig.wechatId,
    );
  }

  /**
   * 处理点击菜单事件
   */
  @Case(WechatEventTypeEnum.CLICK)
  async handleClickEvent({
    response,
    notifyData,
    officialAccountConfig,
    terminalType,
    terminalId,
  }: HandleEventParam) {
    // 处理关键字回复
    await this.keywordReply({
      response,
      notifyData,
      terminalType,
      terminalId,
      officialAccountConfig,
    });
  }

  /**
   * 处理关注公众号事件
   */
  @Case(WechatEventTypeEnum.SUBSCRIBE)
  async handleSubscribeEvent(params: HandleEventParam) {
    const {
      response,
      notifyData,
      officialAccountConfig,
      terminalType,
      terminalId,
    } = params;
    // 更新微信用户关注状态
    await this.wechatUserEntityService.update(
      { subscribe: WechatUserSubscribeEnum.TRUE },
      { openid: notifyData.fromUserName },
      0,
    );
    const eventData: QRCodeSceneValue =
      QS.parse(notifyData?.eventKey.replace?.('qrscene_', '')) || {};
    // 判断是携带二维码场景值关注
    if (eventData.mchid) {
      await this.handleScaneMerchantScene(params, Number(eventData.mchid));
      return;
    }
    // 判断是携带二维码场景值关注
    if (eventData.tableid) {
      await this.handleScaneTableScene(params, Number(eventData.tableid));
      return;
    }
    // 判断是携带二维码场景值关注
    if (eventData.gameid) {
      await this.handleScaneGameScene(params, eventData.gameid);
      return;
    }
    // 获取关注回复配置
    const subscribeReply = await this.wechatSubscribeService.getSubscribeReply(
      terminalType,
      terminalId,
    );
    // 判断是否设置了关注回复
    if (subscribeReply?.isActive) {
      // 根据消息类型返回不同的内容
      await this.replyByMsgType(
        subscribeReply,
        response,
        notifyData.fromUserName,
        officialAccountConfig.wechatId,
      );
      return;
    }
    response.send('success');
  }

  /**
   * 根据消息类型返回消息
   * @param messageType
   * @param response
   * @param toUserName
   * @param fromUserName
   * @param param4
   */
  async replyByMsgType(
    target: WechatKeywordEntity | WechatReplySubscribeResp,
    response: FastifyReply,
    toUserName,
    fromUserName,
  ) {
    let material: WechatMaterialEntity;
    // 获取微信素材信息
    if (target?.materialId) {
      if (target.material) {
        material = target.material;
      } else {
        material = await this.materialEntityService.findById(target.materialId);
      }
    }
    switch (target?.type) {
      case WechatKeywordMsgTypeEnum.TEXT:
        // 回复文本消息
        this.replyTextMessage(response, toUserName, fromUserName, target.text);
        break;
      case WechatKeywordMsgTypeEnum.IMAGE:
        // 回复图片消息
        this.replyImageMessage(
          response,
          toUserName,
          fromUserName,
          material.mediaId,
        );
        break;
      case WechatKeywordMsgTypeEnum.VOICE:
        // 回复音频消息
        this.replyVoiceMessage(
          response,
          toUserName,
          fromUserName,
          material.mediaId,
        );
        break;
      case WechatKeywordMsgTypeEnum.VIDEO:
        // 回复视频消息
        this.replyVideoMessage(
          response,
          toUserName,
          fromUserName,
          material.mediaId,
          material.name,
          material.introduction,
        );
        break;
      case WechatKeywordMsgTypeEnum.NEWS:
        // 回复图文消息
        this.replyNewsMessage(response, toUserName, fromUserName, {
          title: target.title,
          introduction: target.introduction,
          linkUrl: target.linkUrl,
          imageUrl: target.imageUrl,
        });
        break;
      default:
        // 将其他消息转发给微信客服系统
        this.transferCustomerService(response, toUserName, fromUserName);
    }
  }

  /**
   * 处理取消关注公众号事件
   */
  @Case(WechatEventTypeEnum.UNSUBSCRIBE)
  async handleUnsubscribeEvent({ response, notifyData }: HandleEventParam) {
    await this.wechatUserEntityService.update(
      { subscribe: WechatUserSubscribeEnum.FALSE },
      { openid: notifyData.fromUserName },
      0,
    );
    response.send('success');
  }

  /**
   * 处理扫描二维码事件
   * @param param0
   */
  @Case(WechatEventTypeEnum.SCAN)
  async handleScanEvent(param: HandleEventParam) {
    const { eventKey } = param.notifyData;
    const eventData: QRCodeSceneValue = QS.parse(eventKey) || {};
    try {
      await switchHandler<
        (param: HandleEventParam, sceneValue: string | number) => void
      >(this, Object.keys(eventData)?.[0], () =>
        param.response.send('success'),
      )(param, Object.values(eventData)?.[0]);
    } catch (err) {
      this.logger.error(err);
      param.response.send('error');
    }
  }

  /**
   * 处理在商户场景扫关注二维码事件
   * @param param0
   * @param mchid
   */
  @Case(QRCodeSceneEnum.MERCHANT_ID)
  async handleScaneMerchantScene(
    {
      response,
      notifyData,
      officialAccountConfig,
      terminalType,
      terminalId,
    }: HandleEventParam,
    merchantId: number,
  ) {
    // 获取扫码回复配置
    const replyConfig = await this.wechatScanCodeService.getScanCodeReply(
      terminalType,
      terminalId,
    );
    if (!replyConfig) {
      this.replyTextMessage(
        response,
        notifyData.fromUserName,
        officialAccountConfig.wechatId,
        '无效的餐桌二维码',
      );
      return '无效的商户二维码';
    }
    const url = this.getWechatAuthUrl(officialAccountConfig.appId, merchantId);
    // 回复图文消息
    this.replyNewsMessage(
      response,
      notifyData.fromUserName,
      officialAccountConfig.wechatId,
      {
        title: replyConfig.title,
        introduction: replyConfig.introduction,
        imageUrl: replyConfig.imageUrl,
        linkUrl: url,
      },
    );
  }

  /**
   * 处理在餐桌场景扫点餐二维码事件
   * @param param0
   * @param mchid
   */
  @Case(QRCodeSceneEnum.TABLE_ID)
  async handleScaneTableScene(
    {
      response,
      notifyData,
      officialAccountConfig,
      terminalType,
      terminalId,
    }: HandleEventParam,
    tableId: number,
  ) {
    // 获取扫码回复配置
    const replyConfig = await this.wechatScanCodeService.getScanCodeReply(
      terminalType,
      terminalId,
    );
    if (!replyConfig) {
      this.replyTextMessage(
        response,
        notifyData.fromUserName,
        officialAccountConfig.wechatId,
        '无效的商户二维码',
      );
      return;
    }
    const table = await this.tableEntityService.findById(tableId, {
      select: ['merchantId'],
    });
    if (!table) {
      this.replyTextMessage(
        response,
        notifyData.fromUserName,
        officialAccountConfig.wechatId,
        '无效的餐桌二维码',
      );
      return;
    }
    // 缓存用户扫码拿到的餐桌id
    await this.merchantTableService.setScanTableId({
      openid: notifyData.fromUserName,
      tableId,
      merchantId: table.merchantId,
    });
    const url = this.getWechatAuthUrl(
      officialAccountConfig.appId,
      table.merchantId,
    );
    // 回复图文消息
    this.replyNewsMessage(
      response,
      notifyData.fromUserName,
      officialAccountConfig.wechatId,
      {
        title: replyConfig.title,
        introduction: replyConfig.introduction,
        imageUrl: replyConfig.imageUrl,
        linkUrl: url,
      },
    );
  }

  /**
   * 处理在游戏场景扫关注二维码事件
   */
  @Case(QRCodeSceneEnum.GAME_ID)
  async handleScaneGameScene(
    { response, notifyData, officialAccountConfig }: HandleEventParam,
    gameId: number | string,
  ) {
    const openid = notifyData.fromUserName;
    const gameInfo = await this.gameEntityService.findById(Number(gameId), {
      select: ['merchantId', 'adminGameId'],
    });
    if (!gameInfo) {
      this.replyTextMessage(
        response,
        notifyData.fromUserName,
        officialAccountConfig.wechatId,
        '无效的二维码',
      );
      return;
    }
    const [userinfo, activityInfo] = await Promise.all([
      // 获取商户下的用户id
      this.merchantUserEntityService.findOne({
        select: ['id', 'nickname'],
        where: {
          merchantId: gameInfo.merchantId,
          openid: notifyData.fromUserName,
        },
      }),
      // 获取关注公众号获得的奖励次数
      this.gameActivityEntityService.findOne({
        select: ['followFreeNum', 'freeNum'],
        where: {
          merchantId: gameInfo.merchantId,
          adminGameId: gameInfo.adminGameId,
        },
      }),
    ]);
    if (!userinfo || !activityInfo) {
      this.replyTextMessage(
        response,
        notifyData.fromUserName,
        officialAccountConfig.wechatId,
        '无效的二维码',
      );
      return;
    }
    const wechatUser = await this.wechatUserEntityService.findOne({
      select: ['subscribedGame'],
      where: { openid },
    });
    if (
      wechatUser?.subscribedGame === WechatUserSubscribedGameEnum.TRUE ||
      activityInfo.followFreeNum < 1
    ) {
      const linkUrl = this.getWechatAppUrl('pages/share/index', {
        gameId: gameInfo.adminGameId,
        userId: userinfo.id,
        merchantId: gameInfo.merchantId,
      });
      // 用户已经领取过关注公众号奖励了，就发送分享好友的图文消息
      return this.replyNewsMessage(
        response,
        notifyData.fromUserName,
        officialAccountConfig.wechatId,
        {
          title: '点击链接分享给好友即可获得免费次数',
          introduction: '打开页面点击右上角分享，或截图二维码发送给好友',
          linkUrl,
          imageUrl: 'https://assets.meeluo.com/5ff5802a07150_06.jpg',
        },
      );
    }
    // 获取当前用户的挑战次数
    let freeNum = await this.gameActivityService.getActivityUserFreeNum(
      activityInfo.id,
      userinfo.id,
    );
    if (!freeNum) {
      freeNum = {
        freeNum:
          Number(activityInfo.freeNum) + Number(activityInfo.followFreeNum),
        invitedFreeNum: 0,
      };
    } else {
      freeNum.freeNum += activityInfo.followFreeNum;
    }
    // 更新当前用户的挑战次数
    await this.gameActivityService.setActivityUserFreeNum(
      activityInfo.id,
      userinfo.id,
      freeNum,
    );
    // 更改用户关注公众号状态
    await this.wechatUserEntityService.update(
      {
        subscribedGame: WechatUserSubscribedGameEnum.TRUE,
      },
      {
        openid,
      },
      userinfo.id,
    );
    // 发送模板消息
    await this.wechatTemplateService
      .sendSubscribeGameNotice(
        {
          openid,
          username: userinfo.nickname,
          subscribeTime: new Date(),
          playNum: activityInfo.followFreeNum,
          gameId: gameInfo.adminGameId,
        },
        gameInfo.merchantId,
      )
      .catch(err => this.logger.error(err));
    response.send('success');
  }

  /**
   * 返回微信支付xml结果
   * @param param0
   */
  renderPaymentXML(
    response: FastifyReply,
    {
      returnCode,
      returnMsg,
    }: {
      returnCode: 'SUCCESS' | 'FAIL';
      returnMsg: string;
    },
  ) {
    response.header('Content-Type', 'text/xml');
    response.status(200);
    const content = `<xml><return_code><![CDATA[${returnCode}]]></return_code><return_msg><![CDATA[${returnMsg}]]></return_msg></xml>`;
    return response.send(content);
  }

  /**
   * 将收到的用户信息转发给微信客服系统
   * @param toUser
   * @param fromUser
   */
  transferCustomerService(
    response: FastifyReply,
    toUser: string,
    fromUser: string,
  ) {
    const content = `
      <MsgType><![CDATA[transfer_customer_service]]></MsgType>
    `;
    return this.renderNotifyXML(response, toUser, fromUser, content);
  }

  /**
   * 返回文本类型消息
   * @param toUser
   * @param fromUser
   * @param text
   */
  replyTextMessage(
    response: FastifyReply,
    toUser: string,
    fromUser: string,
    text: string,
  ) {
    const content = `
      <MsgType><![CDATA[text]]></MsgType>
      <Content><![CDATA[${text}]]></Content>
    `;
    return this.renderNotifyXML(response, toUser, fromUser, content);
  }

  /**
   * 返回视频类型消息
   * @param toUser
   * @param fromUser
   * @param text
   */
  replyVideoMessage(
    response: FastifyReply,
    toUser: string,
    fromUser: string,
    mediaId: string,
    title: string,
    desc: string,
  ) {
    const content = `
      <MsgType><![CDATA[video]]></MsgType>
      <Video>
        <MediaId><![CDATA[${mediaId}]]></MediaId>
        <Title><![CDATA[${title}]]></Title>
        <Description><![CDATA[${desc}]]></Description>
      </Video>
    `;
    return this.renderNotifyXML(response, toUser, fromUser, content);
  }

  /**
   * 返回音频类型消息
   * @param toUser
   * @param fromUser
   * @param text
   */
  replyVoiceMessage(
    response: FastifyReply,
    toUser: string,
    fromUser: string,
    mediaId: string,
  ) {
    const content = `
      <MsgType><![CDATA[voice]]></MsgType>
      <Voice>
        <MediaId><![CDATA[${mediaId}]]></MediaId>
      </Voice>
    `;
    return this.renderNotifyXML(response, toUser, fromUser, content);
  }

  /**
   * 返回图片类型消息
   * @param toUser
   * @param fromUser
   * @param text
   */
  replyImageMessage(
    response: FastifyReply,
    toUser: string,
    fromUser: string,
    mediaId: string,
  ) {
    const content = `
      <MsgType><![CDATA[image]]></MsgType>
      <Image>
        <MediaId><![CDATA[${mediaId}]]></MediaId>
      </Image>
    `;
    return this.renderNotifyXML(response, toUser, fromUser, content);
  }

  /**
   * 返回图文类型消息
   * @param toUser
   * @param fromUser
   * @param text
   */
  replyNewsMessage(
    response: FastifyReply,
    toUser: string,
    fromUser: string,
    {
      title,
      introduction,
      imageUrl,
      linkUrl,
    }: {
      title: string;
      introduction: string;
      imageUrl: string;
      linkUrl: string;
    },
  ) {
    const content = `
      <MsgType><![CDATA[news]]></MsgType>
      <ArticleCount>1</ArticleCount>
      <Articles>
        <item>
          <Title><![CDATA[${title}]]></Title>
          <Description><![CDATA[${introduction}]]></Description>
          <PicUrl><![CDATA[${imageUrl}]]></PicUrl>
          <Url><![CDATA[${linkUrl}]]></Url>
        </item>
      </Articles>
    `;
    return this.renderNotifyXML(response, toUser, fromUser, content);
  }

  /**
   * 返回xml消息格式
   * @param toUser
   * @param fromUser
   * @param content
   */
  private renderNotifyXML(
    response: FastifyReply,
    toUser: string,
    fromUser: string,
    content: string,
  ) {
    response.header('Content-Type', 'text/xml');
    response.status(200);
    const currentTime = Math.floor(new Date().getTime() / 1000);
    const message = `
      <xml>
        <ToUserName><![CDATA[${toUser}]]></ToUserName>
        <FromUserName><![CDATA[${fromUser}]]></FromUserName>
        <CreateTime>${currentTime}</CreateTime>
        ${content}
      </xml>
    `;
    this.logger.info(`Wechat reply: ${message}`);
    return response.send(message);
  }
}
