import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@jiaxinjiang/nest-jwt';
import { CacheProvider } from '@jiaxinjiang/nest-redis';
import { MerchantStaffEntity } from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import { MerchantLoginDTO, IsEncryptEnum } from './passport.dto';
import { CryptoHelperProvider } from '@shared/helper';
import { MERCHANT_JWT_LOGIN_DATA_PREFIX } from '@core/constant';
import { InjectService } from '@jiaxinjiang/nest-orm';
import {
  MerchantAbnormalUserException,
  MerchantAuthFailedException,
  MerchantAuthExpiredException,
  MerchantInvalidUserException,
  MerchantUserDisabledException,
  MerchantIllegalRequestException,
  LandingElsewhereException,
  MerchantDisabledException,
  MerchantExpiredException,
  MerchantUserChangedException,
  InvalidMerchantTokenException,
} from './passport.exception';
import { MerchantStaffService } from '../staff/staff.service';
import { JwtPayload } from './passport.interface';
import { OrmService } from '@typeorm/orm.service';
import { MerchantService } from '../merchant.service';
import { MerchantUserService } from '../user/user.service';

@Injectable()
export class MerchantPassportService extends BaseService {
  constructor(
    @Inject(JwtService)
    private jwtService: JwtService,
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @Inject(MerchantService)
    private merchantService: MerchantService,
    @Inject(MerchantUserService)
    private userService: MerchantUserService,
    @Inject(MerchantStaffService)
    private merchantStaffService: MerchantStaffService,
    @InjectService(MerchantStaffEntity)
    private staffEntityService: OrmService<MerchantStaffEntity>,
  ) {
    super();
  }

  // 登陆会话时长，单位秒
  public loginSessionTime = 3600 * 24 * 7;

  /**
   * 商户管理员用户登陆
   * @param data
   */
  async login({ account, password, encrypt }: MerchantLoginDTO) {
    if (encrypt === IsEncryptEnum.TRUE) {
      password = CryptoHelperProvider.decrypt(password);
    }
    const admin = await this.staffEntityService.findOne({
      where: [
        {
          phone: account,
        },
        {
          email: account,
        },
      ],
    });
    // 检查账号密码是否正确
    if (!admin || !CryptoHelperProvider.compare(password, admin.password)) {
      throw new MerchantInvalidUserException();
    }
    // 检查账号是否可用
    if (!admin.isActive) {
      throw new MerchantUserDisabledException();
    }
    await this.userService.bindWechatUser(admin, 'wechatUser', 'openid');
    const merchant = await this.merchantService.detail(admin.merchantId, false);
    // 检查商户是存在
    if (!merchant) {
      throw new MerchantAbnormalUserException({
        error: '该用户无指定商户',
      });
    }
    // 检查商户状态
    if (!merchant.isActive) {
      throw new MerchantDisabledException();
    }
    // 检查商户有效期
    if (
      merchant.expireTime &&
      merchant.expireTime.getTime() < new Date().getTime()
    ) {
      throw new MerchantExpiredException();
    }
    // 生成jwt签名
    const token: string = this.jwtService.sign({
      userId: admin.id,
      merchantId: admin.merchantId,
    } as JwtPayload);
    const currentTime: Date = new Date();
    const updateInfo: any = {};
    if (!admin.firstLoginTime) {
      // 设置第一次登陆时间
      admin.firstLoginTime = updateInfo.firstLoginTime = currentTime;
    }
    // 设置最后一次登陆时间
    admin.lastLoginTime = updateInfo.lastLoginTime = currentTime;
    const loginData: MerchantIdentity = this.clearExtraFields({
      userId: admin.id,
      merchant,
      token,
      user: admin,
      merchantId: admin.merchantId,
    });
    // 清除用户信息被更改的状态
    await this.merchantStaffService.getStaffChangedSign(admin.id);
    // 缓存用户登陆信息
    await this.saveUserLoginCache(loginData);
    // 更新用户首次登陆和最后一次登陆时间
    await this.staffEntityService.updateById(updateInfo, admin.id, admin.id);
    delete admin.password;
    return loginData;
  }

  /**
   * 商户管理员退出登录
   * @param userId
   */
  async logout(userId: number) {
    const redisKey = MERCHANT_JWT_LOGIN_DATA_PREFIX + userId;
    await this.cacheProvider.del(redisKey);
    return true;
  }

  /**
   * 保存用户登陆信息到redis
   * @param param0
   * @param expireIn
   */
  async saveUserLoginCache({ token, user, merchantId }: MerchantIdentity) {
    const redisKey = MERCHANT_JWT_LOGIN_DATA_PREFIX + user.id;
    await this.cacheProvider.setHash(redisKey, {
      token,
      merchantId,
      user: JSON.stringify(user),
      expireTime: new Date().getTime() + this.loginSessionTime * 1000,
    });
    await this.cacheProvider.expire(redisKey, this.loginSessionTime);
  }

  /**
   * 从redis里获取用户登陆信息
   * @param userId
   */
  async getUserLoginCache(userId: number) {
    const redisKey = MERCHANT_JWT_LOGIN_DATA_PREFIX + userId;
    const [
      token,
      user = 'null',
      expireTime,
      merchantId,
    ] = await this.cacheProvider.getHash(redisKey, [
      'token',
      'user',
      'expireTime',
      'merchantId',
    ]);
    return {
      userId,
      token,
      expireTime,
      merchantId,
      user: JSON.parse(user),
    };
  }

  /**
   * jwt校验
   * @param token
   */
  async validateJwt(token: string) {
    // 效验token格式
    if (!token || !/JWT [\dA-Za-z=]+/.test(token)) {
      throw new MerchantIllegalRequestException({
        error: 'JWT格式不正确',
      });
    }
    token = token.replace('JWT ', '');
    try {
      // token验证，失败会抛出错误
      this.jwtService.verify(token);
      // jwt数据解码，并读取redis缓存的登陆信息
      const { userId, merchantId } = this.jwtService.decode(
        token,
      ) as JwtPayload;
      if (!merchantId) {
        throw new InvalidMerchantTokenException();
      }
      const loginData = await this.getUserLoginCache(userId);
      const { token: redisToken } = loginData;
      // 如果redis中不存在登陆信息，提示登陆过期
      if (!redisToken) {
        throw new MerchantAuthExpiredException();
      }
      // 判断redis存储的token跟用户传来的token是否一致，
      if (redisToken !== token) {
        throw new LandingElsewhereException();
      }
      // 判读用户信息是否被修改
      const userChangedSign = await this.merchantStaffService.getStaffChangedSign(
        userId,
      );
      if (userChangedSign) {
        throw new MerchantUserChangedException();
      }
      // 自动续签
      await this.saveUserLoginCache(loginData);
      return loginData;
    } catch (e) {
      if (e.code) {
        throw e;
      }
      throw new MerchantAuthFailedException({
        error: e.message,
      });
    }
  }
}
