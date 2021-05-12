import { File } from 'fastify-multer/lib/interfaces';
import { Inject } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import { InjectService } from '@jiaxinjiang/nest-orm/dist';
import {
  WechatMaterialEntity,
  WechatMaterialFileTypeEnum,
} from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { WechatMaterialAddVoiceException } from './voice.exception';
import { WechatSettingService } from '../../setting';
import { CommonService } from '@app/common/common.service';
import { WechatOfficialAccountService } from '@shared/wechat';
import { CommonTerminalEnum } from '@app/common/common.enum';

export class WechatMaterialVoiceService extends BaseService {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatSettingService)
    private wechatSettingService: WechatSettingService,
    @Inject(WechatOfficialAccountService)
    private officialAccountService: WechatOfficialAccountService,
    @InjectService(WechatMaterialEntity)
    private materialEntityService: OrmService<WechatMaterialEntity>,
  ) {
    super();
  }

  /**
   * 添加微信音频素材
   * @param param0
   */
  async create({
    name,
    file,
    target,
    terminalId,
    userId,
    materialId,
  }: {
    name: string;
    file: File;
    userId: number;
    target: CommonTerminalEnum;
    terminalId: number;
    materialId?: number;
  }) {
    if (!file?.buffer) {
      throw new WechatMaterialAddVoiceException({
        msg: '请上传正确的素材文件',
      });
    }
    const extension = file.originalname.substring(
      file.originalname.lastIndexOf('.') + 1,
    );
    if (!['mp3', 'wma', 'wav', 'amr'].includes(extension)) {
      throw new WechatMaterialAddVoiceException({
        msg: '音频素材仅支持mp3/wma/wav/amr格式',
      });
    }
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      terminalId,
    );
    const account = this.officialAccountService.getAccount(config);
    const condition = this.commonService.getTerminalCondition(
      target,
      terminalId,
    );
    const mediaResp = await account.material.uploadVoice(file);
    if (!mediaResp?.mediaId) {
      throw new WechatMaterialAddVoiceException({
        msg: mediaResp.errmsg,
      });
    }
    if (materialId) {
      return this.materialEntityService.updateOne(
        {
          name,
          url: mediaResp.url,
          mediaId: mediaResp.mediaId,
        },
        {
          id: materialId,
          ...condition,
        },
        userId,
      );
    }
    return this.materialEntityService.create(
      {
        ...condition,
        name,
        appid: config.appId,
        fileType: WechatMaterialFileTypeEnum.VOICE,
        url: mediaResp.url,
        mediaId: mediaResp.mediaId,
      },
      userId,
    );
  }

  /**
   * 修改微信音频素材
   * @param param0
   * @param param1
   */
  async update({
    name,
    file,
    userId,
    target,
    terminalId,
    materialId,
  }: {
    name: string;
    file?: File;
    userId: number;
    target: CommonTerminalEnum;
    terminalId: number;
    materialId?: number;
  }) {
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      terminalId,
    );
    const account = this.officialAccountService.getAccount(config);
    const condition = this.commonService.getTerminalCondition(
      target,
      terminalId,
    );
    const material = await this.materialEntityService.findOne({
      where: {
        id: materialId,
        ...condition,
        fileType: WechatMaterialFileTypeEnum.VOICE,
      },
    });
    // 删除当前素材
    await account.material.delete(material.mediaId);
    if (!file) {
      return this.materialEntityService.updateOne(
        {
          name,
        },
        {
          id: materialId,
          ...condition,
        },
        userId,
      );
    }
    // 上传音频素材
    return this.create({
      materialId,
      name,
      file,
      target,
      terminalId,
      userId,
    });
  }
}
