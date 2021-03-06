import { Injectable, Inject } from '@nestjs/common';
import {
  MEELUO_SHOP_DATABASE,
  CLIENT_JWT_LOGIN_DATA_PREFIX,
} from '@core/constant';
import {
  ClientWechatLoginDTO,
  ClientLoginRespDTO,
  ClientJwtPayloadDTO,
  WechatUserInfoDTO,
} from './passport.dto';
import {
  MerchantUserEntity,
  WechatUserEntity,
  WechatAppTypeEnum,
  MerchantStaffEntity,
  MerchantStaffIsActiveEnum,
  MerchantEntity,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  TransactionRepository,
  Transaction,
  Repository,
  InjectService,
} from '@jiaxinjiang/nest-orm';
import {
  ClientLoginFailedException,
  ClientUserChangedException,
  ClientMerchantNotExistsException,
  ClientMerchantDisabledException,
  ClientIllegalRequestException,
  ClientAuthExpiredException,
  ClientLandingElsewhereException,
  ClientAuthFailedException,
  ClientUserDisabledException,
} from './passport.exception';
import { StringHelperProvider } from '@shared/helper';
import { JwtService } from '@jiaxinjiang/nest-jwt';
import { CacheProvider } from '@jiaxinjiang/nest-redis';
import { OrmService } from '@typeorm/orm.service';
import { MerchantUserService } from '@app/merchant/user/user.service';
import { MerchantWechatService } from '@app/merchant/wechat/wechat.service';
import { ClientMerchantService } from '../merchant/merchant.service';
import { MerchantUserGradeService } from '@app/merchant/user/grade/grade.service';

@Injectable()
export class ClientPassportService extends BaseService {
  constructor(
    @Inject(JwtService)
    private jwtService: JwtService,
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @Inject(MerchantUserGradeService)
    private merchantGradeService: MerchantUserGradeService,
    @Inject(MerchantUserService)
    private merchantUserService: MerchantUserService,
    @Inject(MerchantWechatService)
    private merchantWechatService: MerchantWechatService,
    @Inject(ClientMerchantService)
    private merchantService: ClientMerchantService,
    @InjectService(MerchantStaffEntity)
    private staffEntityService: OrmService<MerchantStaffEntity>,
  ) {
    super();
  }

  /**
   *  ????????????????????????
   * @param code
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async wechatLogin(
    body: ClientWechatLoginDTO,
    merchantId: number,
    @TransactionRepository(WechatUserEntity)
    wechatUserRepo?: Repository<WechatUserEntity>,
    @TransactionRepository(MerchantUserEntity)
    merchantUserRepo?: Repository<MerchantUserEntity>,
  ): Promise<ClientLoginRespDTO> {
    const merchant = await this.merchantService.detail(merchantId);
    // ????????????????????????
    if (!merchant) {
      throw new ClientMerchantNotExistsException();
    }
    // ???????????????????????????
    if (!merchant.isActive) {
      throw new ClientMerchantDisabledException();
    }
    const wechatUserInfo: WechatUserInfoDTO = await this.getWechatUserInfo(
      body,
      merchant,
    );
    if (!wechatUserInfo?.openid) {
      throw new ClientLoginFailedException({ msg: '??????????????????' });
    }
    const currentTime: Date = new Date();
    const wechatUserEntityService = this.getService<
      WechatUserEntity,
      OrmService<WechatUserEntity>
    >(wechatUserRepo);
    const merchantUserEntityService = this.getService<
      MerchantUserEntity,
      OrmService<MerchantUserEntity>
    >(merchantUserRepo);
    const wechatUser = await wechatUserEntityService.upsert(
      wechatUserInfo,
      { openid: wechatUserInfo.openid },
      0,
    );
    let isNewUser: 0 | 1 = 0;
    // ????????????????????????
    let merchantUser = await merchantUserEntityService.findOne({
      where: { openid: wechatUserInfo.openid, merchantId },
    });
    if (!merchantUser) {
      merchantUser = await merchantUserEntityService.create(
        {
          nickname: wechatUserInfo.nickname,
          gender: wechatUserInfo.gender,
          avatar: wechatUserInfo.avatar,
          openid: wechatUserInfo.openid,
          firstLoginTime: currentTime,
          lastLoginTime: currentTime,
          inviteUserId: body.inviteUserId || null,
          merchantId,
        },
        0,
      );
      isNewUser = 1;
    } else {
      // ??????????????????????????????
      if (!merchantUser.isActive) {
        throw new ClientUserDisabledException();
      }
      merchantUser.nickname = wechatUserInfo.nickname || merchantUser.nickname;
      merchantUser.gender = wechatUserInfo.gender || merchantUser.gender;
      merchantUser.avatar = wechatUserInfo.avatar || merchantUser.avatar;
      merchantUser.loginCount += 1;
      merchantUser.lastLoginTime = currentTime;
      await merchantUserEntityService.updateById(
        merchantUser,
        merchantUser.id,
        0,
      );
    }
    const [staffInfo] = await Promise.all([
      this.getStaffInfo({ openid: wechatUserInfo.openid, merchantId }),
      this.merchantGradeService.bindUsersGrade(merchantUser, merchantId),
    ]);
    merchantUser.wechatUser = wechatUser;
    const jwtPayload: ClientJwtPayloadDTO = {
      staffId: staffInfo?.id,
      userId: merchantUser.id,
      merchantId,
      merchantName: merchant.name,
      openid: wechatUserInfo.openid,
    };
    // ??????jwt??????
    const token: string = this.jwtService.sign(jwtPayload);
    // ????????????????????????????????????
    await this.merchantUserService.getUserChangedSign(merchantUser.id);
    // ??????????????????
    await this.saveLoginToken(token, merchantUser.id);
    return {
      token,
      user: this.clearExtraFields(merchantUser),
      merchant: this.clearExtraFields(merchant),
      staff: staffInfo,
      isNewUser,
    };
  }

  /**
   * ???????????????????????????redis
   * @param param0
   * @param expireIn
   */
  async saveLoginToken(token: string, userId: number) {
    const redisKey = CLIENT_JWT_LOGIN_DATA_PREFIX + userId;
    // ????????????????????????7???
    await this.cacheProvider.set<string>(redisKey, token, {
      ttl: 3600 * 24 * 7,
    });
  }

  /**
   * ???redis???????????????????????????
   * @param userId
   */
  async getLoginToken(userId: number) {
    const redisKey = CLIENT_JWT_LOGIN_DATA_PREFIX + userId;
    return this.cacheProvider.get<string>(redisKey);
  }

  /**
   * jwt??????
   * @param token
   */
  async validateJwt(token: string): Promise<ClientIdentity> {
    // ??????token??????
    if (!token || !/JWT [\dA-Za-z=]+/.test(token)) {
      throw new ClientIllegalRequestException({
        error: 'JWT???????????????',
      });
    }
    token = token.replace('JWT ', '');
    try {
      // token??????????????????????????????
      this.jwtService.verify(token);
      // jwt????????????????????????redis?????????????????????
      const payload = this.jwtService.decode(token) as ClientJwtPayloadDTO;
      const redisToken = await this.getLoginToken(payload.userId);
      // ??????redis?????????????????????????????????????????????
      if (!redisToken) {
        throw new ClientAuthExpiredException();
      }
      // ??????redis?????????token??????????????????token???????????????
      if (redisToken !== token) {
        throw new ClientLandingElsewhereException();
      }
      // ?????????????????????????????????
      const userChangedSign = await this.merchantUserService.getUserChangedSign(
        payload.userId,
      );
      if (userChangedSign) {
        throw new ClientUserChangedException();
      }
      // ????????????
      await this.saveLoginToken(redisToken, payload.userId);
      return payload;
    } catch (e) {
      if (e.code) {
        throw e;
      }
      throw new ClientAuthFailedException({
        error: e.message,
      });
    }
  }

  async logout(userId: number) {
    const redisKey = CLIENT_JWT_LOGIN_DATA_PREFIX + userId;
    await this.cacheProvider.del(redisKey);
    return true;
  }

  /**
   * ??????????????????????????????????????????????????????????????????????????????
   * @param param0
   */
  async getStaffInfo({
    openid,
    merchantId,
  }: {
    openid: string;
    merchantId: number;
  }) {
    return this.staffEntityService.findOne({
      select: [
        'openid',
        'username',
        'nickname',
        'staffNo',
        'avatar',
        'isNative',
        'isActive',
        'email',
        'phone',
      ],
      where: {
        merchantId,
        openid,
        isActive: MerchantStaffIsActiveEnum.TRUE,
      },
    });
  }

  async getWechatUserInfo(
    { code, snsApi }: ClientWechatLoginDTO,
    merchant: MerchantEntity,
  ) {
    // ???????????????????????????????????????
    const account = await this.merchantWechatService.getOfficialAccount(
      merchant.id,
      merchant,
    );
    // ?????????????????????????????????
    const { id, original } = await account.oauth.user(code, snsApi);
    const user = original || (await account.user.get(id));
    const userinfo: WechatUserInfoDTO = {
      subscribe: user['subscribe'],
      appId: account.getConfig()['appid'],
      avatar: user.headimgurl,
      city: user.city,
      country: user.country,
      gender: user.sex,
      nickname: user.nickname || `??????_${StringHelperProvider.getRandomStr(6)}`,
      openid: id,
      province: user.province,
      appType: WechatAppTypeEnum.OFFICIAL_ACCOUNT,
    };
    return userinfo;
  }
}
