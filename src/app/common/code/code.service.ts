import SMSConfig from '@config/sms.config';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';
import { CacheProvider, ServiceCache } from '@jiaxinjiang/nest-redis';
import { Inject, Injectable } from '@nestjs/common';
import { StringHelperProvider } from '@shared/helper';
import { CLIENT_PHONE_VERIFY_FAILED_COUNT } from '@core/constant';
import { CodeVerifyException } from './code.exception';

@Injectable()
export class CodeService {
  constructor(
    @InjectLogger(CodeService)
    private logger: LoggerProvider,
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
  ) {}

  /**
   * 获取短信验证码，有效期5分钟
   * @param param0
   */
  @ServiceCache(5 * 60)
  async getSMSCode(phone: string) {
    const length = 4,
      type = 'int';
    const code = StringHelperProvider.getRandomStr(length, type);
    this.logger.info(`手机号: ${phone} 生成数字验证码：${code}`);
    return {
      code,
      phone,
    };
  }

  /**
   * 清除短信验证码
   * @param userId
   * @returns
   */
  async clearSMSCode(phone: string) {
    return this.cacheProvider.clearServiceCache(this.getSMSCode, phone);
  }

  /**
   * 生成新短信验证码
   * @param userId
   * @returns
   */
  async genSMSCode(phone: string) {
    // 先清除验证码，再重新生成，为了刷新时间
    await this.clearSMSCode(phone);
    // 清空错误次数
    await this.cacheProvider.del(
      `${CLIENT_PHONE_VERIFY_FAILED_COUNT}:${phone}`,
    );
    const { code } = await this.getSMSCode(phone);
    return code;
  }

  /**
   * 对比短信验证码是否正确
   * @param userId
   * @param merchantId
   * @param code
   * @returns
   */
  async verifySMSCode(phone: string, code: string) {
    const originCode = await this.getSMSCode(phone);
    if (String(originCode?.code) !== String(code)) {
      const redisKey = `${CLIENT_PHONE_VERIFY_FAILED_COUNT}:${phone}`;
      // 增加短信验证失败次数
      const count = await this.cacheProvider.incr(redisKey, 5 * 60);
      // 判断验证失败次数超过指定数量
      if (count > SMSConfig.sendLimit.verifyCount) {
        // 清空验证码
        await this.clearSMSCode(phone);
        // 提示重新发送
        throw new CodeVerifyException({
          msg: `错误次数超过${SMSConfig.sendLimit.verifyCount}次，请重新发送`,
        });
      }
      return false;
    }
    await this.clearSMSCode(phone);
    return true;
  }
}
