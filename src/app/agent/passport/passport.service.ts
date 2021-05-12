import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@jiaxinjiang/nest-jwt';
import { CacheProvider } from '@jiaxinjiang/nest-redis';
import { AgentUserEntity, AgentEntity } from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import { AgentLoginDTO, IsEncryptEnum } from './passport.dto';
import { CryptoHelperProvider } from '@shared/helper';
import { AGENT_JWT_LOGIN_DATA_PREFIX } from '@core/constant';
import { InjectService } from '@jiaxinjiang/nest-orm';
import {
  AgentDisabledException,
  AgentExpiredException,
  AgentAbnormalUserException,
  AgentAuthFailedException,
  AgentAuthExpiredException,
  AgentInvalidUserException,
  AgentUserDisabledException,
  AgentIllegalRequestException,
  LandingElsewhereException,
} from './passport.exception';
import { JwtPayload } from './passport.interface';
import { OrmService } from '@typeorm/orm.service';
import { IsDeleteEnum } from '@typeorm/base.entity';

@Injectable()
export class AgentPassportService extends BaseService {
  constructor(
    @Inject(JwtService)
    private jwtService: JwtService,
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @InjectService(AgentEntity)
    private agentEntityService: OrmService<AgentEntity>,
    @InjectService(AgentUserEntity)
    private agentUserEntityService: OrmService<AgentUserEntity>,
  ) {
    super();
  }

  // 登陆会话时长，单位秒
  public loginSessionTime = 3600 * 24 * 7;

  /**
   * 代理商管理员用户登陆
   * @param data
   */
  async login({ account, password, encrypt }: AgentLoginDTO) {
    if (encrypt === IsEncryptEnum.TRUE) {
      password = CryptoHelperProvider.decrypt(password);
    }
    const user = await this.agentUserEntityService.findOne({
      where: [
        {
          isDelete: IsDeleteEnum.FALSE,
          phone: account,
        },
        {
          isDelete: IsDeleteEnum.FALSE,
          email: account,
        },
      ],
    });
    // 检查账号密码是否正确
    if (!user || !CryptoHelperProvider.compare(password, user.password)) {
      throw new AgentInvalidUserException();
    }
    // 检查账号是否可用
    if (!user.isActive) {
      throw new AgentUserDisabledException();
    }
    const agent = await this.agentEntityService.findById(user.agentId);
    // 检查代理商是否存在
    if (!agent) {
      throw new AgentAbnormalUserException({
        error: '无效的代理商用户',
      });
    }
    // 检查代理商状态
    if (!agent.isActive) {
      throw new AgentDisabledException();
    }
    // 检查商户有效期
    if (agent.expireTime && agent.expireTime.getTime() < new Date().getTime()) {
      throw new AgentExpiredException();
    }
    // 生成jwt签名
    const token: string = this.jwtService.sign({
      userId: user.id,
    } as JwtPayload);
    const currentTime: Date = new Date();
    const updateInfo: any = {};
    if (!user.firstLoginTime) {
      // 设置第一次登陆时间
      user.firstLoginTime = updateInfo.firstLoginTime = currentTime;
    }
    // 设置最后一次登陆时间
    user.lastLoginTime = updateInfo.lastLoginTime = currentTime;
    const loginData: AgentIdentity = this.clearExtraFields({
      agentId: agent.id,
      userId: user.id,
      token,
      user,
    });
    // 缓存用户登陆信息
    await this.saveUserLoginCache(loginData);
    // 更新用户首次登陆和最后一次登陆时间
    await this.agentUserEntityService.updateById(updateInfo, user.id, user.id);
    delete user.password;
    return loginData;
  }

  /**
   * 代理商管理员退出登录
   * @param userId
   */
  async logout(userId: number) {
    const redisKey = AGENT_JWT_LOGIN_DATA_PREFIX + userId;
    await this.cacheProvider.del(redisKey);
    return true;
  }

  /**
   * 保存用户登陆信息到redis
   * @param param0
   * @param expireIn
   */
  async saveUserLoginCache({ token, user, agentId }: AgentIdentity) {
    const redisKey = AGENT_JWT_LOGIN_DATA_PREFIX + user.id;
    await this.cacheProvider.setHash(redisKey, {
      agentId,
      token,
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
    const redisKey = AGENT_JWT_LOGIN_DATA_PREFIX + userId;
    const [
      agentId,
      token,
      user = 'null',
      expireTime,
    ] = await this.cacheProvider.getHash(redisKey, [
      'agentId',
      'token',
      'user',
      'expireTime',
    ]);
    return {
      agentId,
      userId,
      token,
      expireTime,
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
      throw new AgentIllegalRequestException({
        error: 'JWT格式不正确',
      });
    }
    token = token.replace('JWT ', '');
    try {
      // token验证，失败会抛出错误
      this.jwtService.verify(token);
      // jwt数据解码，并读取redis缓存的登陆信息
      const { userId } = this.jwtService.decode(token) as JwtPayload;
      const loginData = await this.getUserLoginCache(userId);
      const { token: redisToken } = loginData;
      // 如果redis中不存在登陆信息，提示登陆过期
      if (!redisToken) {
        throw new AgentAuthExpiredException();
      }
      // 判断redis存储的token跟用户传来的token是否一致，
      if (redisToken !== token) {
        throw new LandingElsewhereException();
      }
      // 自动续签
      await this.saveUserLoginCache(loginData);
      return loginData;
    } catch (e) {
      if (e.code) {
        throw e;
      }
      throw new AgentAuthFailedException({
        error: e.message,
      });
    }
  }
}
