import * as yly from 'yly-nodejs-sdk';
import { ServiceCache } from '@jiaxinjiang/nest-redis';
import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigOptions, Token } from './yilian.interface';
import {
  YiLianGetTokenException,
  YiLianAddPrinterException,
  YiLianPrintTextException,
  YiLianDeletePrinterException,
  YiLianPrintImageException,
  YiLianGetPrinterStatusException,
} from './yilian.exception';
import { YILIAN_OPTION } from './yilian.constant';
import { BaseExceptionConstructor } from '@jiaxinjiang/nest-exception';

@Injectable()
export class YiLianService {
  private logger: Logger | LoggerService;
  private config: yly.Config;
  private oauthClient: yly.OauthClient;

  constructor(@Inject(YILIAN_OPTION) private yiLianOption: ConfigOptions) {
    const { logger, cid, secret } = this.yiLianOption;
    this.config = new yly.Config({ cid, secret });
    this.oauthClient = new yly.OauthClinet(this.config);
    this.logger = logger || new Logger(YiLianService.name);
  }

  /**
   * 从缓存里获取易联云token
   * @param cid
   * @param secret
   * @param _cacheOptions
   * @returns
   */
  @ServiceCache(12 * 3600) //  缓存12小时
  async getToken(_cacheOptions?: { __updateCache: boolean }): Promise<Token> {
    const resp = await this.oauthClient.getToken();
    await this.checkErrorRespone(resp, YiLianGetTokenException);
    return {
      accessToken: resp.body['access_token'],
      refreshToken: resp.body['refresh_token'],
    };
  }

  async getRpcClient() {
    const token = await this.getToken();
    return new yly.RpcClient(token.accessToken, this.config);
  }
  async getPrint() {
    const rpcClient = await this.getRpcClient();
    return new yly.Print(rpcClient);
  }

  async getPicturePrint() {
    const rpcClient = await this.getRpcClient();
    return new yly.PicturePrint(rpcClient);
  }

  async getPrinter() {
    const rpcClient = await this.getRpcClient();
    return new yly.Printer(rpcClient);
  }

  /**
   * 自有型应用授权终端
   * @param machineCode 机器码
   * @param msign 机器密钥
   * @param nickName 打印机昵称
   * @param phone gprs卡号
   * @returns {*}
   */
  async addPrinter({
    machineCode,
    msign,
    nickName = '',
    phone = '',
  }: {
    machineCode: string;
    msign: string;
    nickName?: string;
    phone?: string;
  }) {
    const printer = await this.getPrinter();
    const resp = await printer.addPrinter(machineCode, msign, nickName, phone);
    await this.checkErrorRespone(resp, YiLianAddPrinterException);
    return resp.body;
  }

  /**
   * 删除终端授权接口
   * @param machineCode 机器码
   * @returns {*}
   */
  async deletePrinter(machineCode: string) {
    const printer = await this.getPrinter();
    const resp = await printer.deletePrinter(machineCode);
    await this.checkErrorRespone(resp, YiLianDeletePrinterException);
    return resp.body;
  }

  /**
   * 获取终端状态接口
   * @param machineCode 机器码
   * @returns {*}
   */
  async getPrintStatus(machineCode: string) {
    const printer = await this.getPrinter();
    const resp = await printer.getPrintStatus(machineCode);
    await this.checkErrorRespone(resp, YiLianGetPrinterStatusException);
    return resp.body;
  }

  /**
   * 文本打印
   * @param machineCode 设备编号
   * @param originId 系统内部订单号
   * @param content 打印的文本内容
   */
  async printText({
    machineCode,
    originId,
    content,
  }: {
    machineCode: string;
    originId: number | string;
    content: string;
  }) {
    this.logger.log(content);
    const print = await this.getPrint();
    const resp = await print.index(machineCode, originId, content);
    await this.checkErrorRespone(resp, YiLianPrintTextException);
    return resp.body;
  }

  /**
   * 图形打印接口  (不支持机型: k4-wh, k4-wa, m1)
   * @param machineCode 机器码
   * @param pictureUrl 图片链接地址
   * @param originId 商户系统内部订单号，要求32个字符内，只能是数字、大小写字母
   * @returns {*}
   */
  async printImage({
    machineCode,
    pictureUrl,
    originId,
  }: {
    machineCode: string;
    pictureUrl: string;
    originId: string | number;
  }) {
    const print = await this.getPicturePrint();
    const resp = await print.index(machineCode, pictureUrl, originId);
    await this.checkErrorRespone(resp, YiLianPrintImageException);
    return resp.body;
  }

  /**
   * 处理错误请求结果
   * @param resp
   * @param Exception
   * @returns
   */
  async checkErrorRespone(resp, Exception?: BaseExceptionConstructor) {
    this.logger.log(resp);
    const errorCode = Number(resp?.error);
    if (errorCode === 0) {
      return;
    }
    const errMsg = resp?.['error_description'] || '打印服务异常';
    // 判断状态码是否是token已过期
    if ([6, 18, 20].includes(errorCode)) {
      await this.getToken({ __updateCache: true });
    }
    if (Exception) {
      throw new Exception({
        msg: errMsg,
      });
    } else {
      throw new Error(errMsg);
    }
  }
}
