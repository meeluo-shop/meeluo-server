import { createReadStream } from 'fs';
import { conf, zone, rs, auth, form_up as formUp, sms } from 'qiniu';
import { Injectable, Inject } from '@nestjs/common';
import { QINIU_OPTION, DEFAULT_CALLBACK_BODY } from './qiniu.constant';
import { QiniuOption } from './qiniu.interface';
import { QiniuUploadTypeEnum } from './qiniu.enum';
import { ServiceCache } from '@jiaxinjiang/nest-redis';
import { UtilHelperProvider } from '@shared/helper';
import { InjectLogger, LoggerProvider } from '@jiaxinjiang/nest-logger';

@Injectable()
export class QiniuService {
  private bucketManager: rs.BucketManager;
  private mac: auth.digest.Mac;
  private qiniuOption: QiniuOption;

  constructor(
    @InjectLogger(QiniuService)
    private logger: LoggerProvider,
    @Inject(QINIU_OPTION) private qiniuOptions: QiniuOption[],
  ) {}

  public init(bucket: string) {
    this.qiniuOption = this.qiniuOptions.find(item => item.bucket === bucket);
    if (!this.qiniuOption) {
      throw new Error(`Not found qiniu bucket(${bucket})`);
    }
    const { accessKey, secretKey, config = {} } = this.qiniuOption;
    this.qiniuOption.config = {
      // 空间对应的机房（华北）
      zone: zone.Zone_z1,
      useHttpsDomain: true,
      useCdnDomain: true,
      ...config,
    };
    this.mac = new auth.digest.Mac(accessKey, secretKey);
    this.bucketManager = new rs.BucketManager(
      this.mac,
      new conf.Config(config),
    );
  }

  /**
   * 客户端获取上传凭证
   */
  @ServiceCache(2 * 3600) // 缓存2小时
  getToken(_cacheOptions?: { __updateCache: boolean }) {
    const { bucket, putPolicy } = this.qiniuOption;
    const options: rs.PutPolicyOptions = {
      scope: bucket,
      expires: 3 * 3600, // 有效期为3小时
      returnBody: DEFAULT_CALLBACK_BODY,
      callbackBody: DEFAULT_CALLBACK_BODY,
      callbackBodyType: 'application/json',
      ...putPolicy,
    };
    const policy = new rs.PutPolicy(options);
    return policy.uploadToken(this.mac);
  }

  /**
   * 上传文件
   * @param token
   * @param key
   * @param file
   */
  async upload(
    token: string,
    key: string,
    file,
    updateType: QiniuUploadTypeEnum = QiniuUploadTypeEnum.STREAM,
  ) {
    if (typeof file === 'string') {
      file = createReadStream(file);
    }
    const { config = {} } = this.qiniuOption;
    const method = {
      [QiniuUploadTypeEnum.FILE]: 'putFile',
      [QiniuUploadTypeEnum.BYTES]: 'put',
      [QiniuUploadTypeEnum.STREAM]: 'putStream',
    }[updateType];
    return new Promise((resolve, reject) => {
      const formUploader = new formUp.FormUploader(config);
      const putExtra = new formUp.PutExtra();
      formUploader[method](token, key, file, putExtra, (err, respBody) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(respBody.toString());
      });
    });
  }

  /**
   * 批量删除文件
   * @param keys
   */
  async delete(keys: string[]) {
    const { bucket } = this.qiniuOption;
    //每个operations的数量不可以超过1000个，如果总数量超过1000，需要分批发送
    const deleteOperations = keys.map(key => rs.deleteOp(bucket, key));
    return new Promise((resolve, reject) => {
      this.bucketManager.batch(deleteOperations, (err, respBody) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(respBody.toString());
      });
    });
  }

  /**
   * 格式化短信返回结果
   * @param content
   * @returns
   */
  transformSMSResponseMsg(content: string) {
    let data: sms.message.MsgResp;
    try {
      data = JSON.parse(content);
      data = UtilHelperProvider.snakeToHump(data);
    } catch (err) {
      throw new Error(content);
    }
    if (data.error) {
      throw new Error(data.message);
    }
    return data;
  }

  /**
   * 批量发送短信
   * @param params
   * @returns
   */
  async sendSms(params: sms.message.MsgParam) {
    return new Promise((resolve, reject) => {
      params = UtilHelperProvider.humpToSnake(params);
      sms.message.sendMessage(params, this.mac, (err, respBody) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          const data = this.transformSMSResponseMsg(respBody.toString());
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * 发送单条短信
   * @param params
   * @returns
   */
  async sendSingleSMS(params: sms.message.SingleMsgParam) {
    return new Promise((resolve, reject) => {
      params = UtilHelperProvider.humpToSnake(params);
      sms.message.sendSingleMessage(params, this.mac, (err, respBody) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          const data = this.transformSMSResponseMsg(respBody.toString());
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * 发送单条国际/港澳台短信
   * @param params
   * @returns
   */
  async sendOverseaSMS(params: sms.message.SingleMsgParam) {
    return new Promise((resolve, reject) => {
      params = UtilHelperProvider.humpToSnake(params);
      sms.message.sendOverseaMessage(params, this.mac, (err, respBody) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          const data = this.transformSMSResponseMsg(respBody.toString());
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * 发送全文本短信(不需要传模版 ID)
   * @param params
   * @returns
   */
  async sendFulltextSMS(params: sms.message.FulltextMessageParam) {
    return new Promise((resolve, reject) => {
      params = UtilHelperProvider.humpToSnake(params);
      sms.message.sendFulltextMessage(params, this.mac, (err, respBody) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          const data = this.transformSMSResponseMsg(respBody.toString());
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
