import SMSConfig from '@config/sms.config';
import {
  CLIENT_USER_SEND_SMS_TIMEOUT,
  CLIENT_PHONE_SEND_SMS_COUNT,
  CLIENT_USER_SEND_SMS_COUNT,
  MEELUO_BUCKET,
} from '@core/constant';
import { Inject } from '@nestjs/common';
import { InjectQiniuService, QiniuService } from '@shared/qiniu';
import { CodeService } from '../code';
import { DateHelperProvider } from '@shared/helper';
import { CacheProvider } from '@jiaxinjiang/nest-redis';
import {
  SMSSendOftenException,
  SMSSendCountLimitException,
} from './sms.exception';

export class SMSService {
  constructor(
    @InjectQiniuService(MEELUO_BUCKET)
    private qiniuService: QiniuService,
    @Inject(CodeService)
    private codeService: CodeService,
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
  ) {}

  /**
   * 验证用户发送短信时长
   * @param userId
   * @param time
   */
  async checkUserSendOften(userId: number, time = 60) {
    const key = `${CLIENT_USER_SEND_SMS_TIMEOUT}:${userId}`;
    const ret = await this.cacheProvider.setnx(key, 1, time);
    if (!ret) {
      throw new SMSSendOftenException();
    }
    return true;
  }

  /**
   * 判断手机被发送数量是否超过限制
   * @param mobile
   */
  async checkMobileSendToMuch(mobile: string) {
    const todaySurplus = DateHelperProvider.getTodaySurplus();
    const key = `${CLIENT_PHONE_SEND_SMS_COUNT}:${mobile}`;
    const count = await this.cacheProvider.incr(key, todaySurplus);
    if (count > SMSConfig.sendLimit.mobileCount) {
      throw new SMSSendCountLimitException({
        msg: '该手机号短信发送数量已达上限，请明日再发',
      });
    }
    return true;
  }

  /**
   * 判断用户发送数量是否超过限制
   * @param userId
   */
  async checkUserSendToMuch(userId: number) {
    const todaySurplus = DateHelperProvider.getTodaySurplus();
    const key = `${CLIENT_USER_SEND_SMS_COUNT}:${userId}`;
    const count = await this.cacheProvider.incr(key, todaySurplus);
    if (count > SMSConfig.sendLimit.userCount) {
      throw new SMSSendCountLimitException();
    }
    return true;
  }

  /**
   * 发送短信二维码
   * @param userId
   * @param mobile
   */
  async sendSMSCode(userId: number, mobile: string) {
    await this.checkUserSendOften(userId);
    await this.checkUserSendToMuch(userId);
    await this.checkMobileSendToMuch(mobile);
    const code = await this.codeService.genSMSCode(mobile);
    return this.qiniuService.sendSingleSMS({
      templateId: SMSConfig.templates.VERIFICATION_CODE,
      mobile,
      parameters: { code },
    });
  }
}
