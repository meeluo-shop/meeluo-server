import { File } from 'fastify-multer/lib/interfaces';
import { Inject } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import { InjectService } from '@jiaxinjiang/nest-orm/dist';
import {
  WechatMaterialEntity,
  WechatMaterialFileTypeEnum,
} from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { WechatMaterialAddVideoException } from './video.exception';
import { CommonService } from '@app/common/common.service';
import { WechatSettingService } from '../../setting';
import { WechatOfficialAccountService } from '@shared/wechat';
import { CommonTerminalEnum } from '@app/common/common.enum';

export class WechatMaterialVideoService extends BaseService {
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
   * 添加微信视频素材
   * @param param0
   */
  async create({
    name,
    file,
    terminalId,
    target,
    materialId,
    introduction,
    userId,
  }: {
    name: string;
    introduction: string;
    file: File;
    target: CommonTerminalEnum;
    terminalId: number;
    userId: number;
    materialId?: number;
  }) {
    if (!file?.buffer) {
      throw new WechatMaterialAddVideoException({
        msg: '请上传正确的素材文件',
      });
    }
    const extension = file.originalname.substring(
      file.originalname.lastIndexOf('.') + 1,
    );
    if (!['mp4'].includes(extension)) {
      throw new WechatMaterialAddVideoException({
        msg: '视频素材仅支持mp4格式',
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
    const mediaResp = await account.material.uploadVideo(
      file,
      name,
      introduction,
    );
    if (!mediaResp?.mediaId) {
      throw new WechatMaterialAddVideoException({
        msg: mediaResp.errmsg,
      });
    }
    if (materialId) {
      return this.materialEntityService.updateOne(
        {
          name,
          url: mediaResp.url,
          mediaId: mediaResp.mediaId,
          introduction,
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
        fileType: WechatMaterialFileTypeEnum.VIDEO,
        url: mediaResp.url,
        mediaId: mediaResp.mediaId,
        introduction,
      },
      userId,
    );
  }

  /**
   * 修改微信视频素材
   * @param param0
   * @param param1
   */
  async update({
    name,
    file,
    target,
    terminalId,
    userId,
    materialId,
    introduction,
  }: {
    name: string;
    file: File;
    target: CommonTerminalEnum;
    terminalId: number;
    userId: number;
    materialId?: number;
    introduction: string;
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
        fileType: WechatMaterialFileTypeEnum.VIDEO,
      },
    });
    if (!file) {
      return this.materialEntityService.updateOne(
        {
          name,
          introduction,
        },
        {
          id: materialId,
          ...condition,
        },
        userId,
      );
    }
    // 上传视频素材
    const media = await this.create({
      materialId,
      name,
      file,
      target,
      terminalId,
      userId,
      introduction,
    });
    // 删除当前素材
    await account.material.delete(material.mediaId);
    return media;
  }
}
