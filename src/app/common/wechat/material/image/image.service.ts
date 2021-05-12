import * as lodash from 'lodash';
import { HttpService, Inject } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import { InjectService } from '@jiaxinjiang/nest-orm/dist';
import {
  CommonResourceEntity,
  WechatMaterialEntity,
  WechatMaterialFileTypeEnum,
} from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { WechatMaterialAddImageException } from './image.exception';
import { WechatMaterialImageDTO } from './image.dto';
import { CommonTerminalEnum } from '@app/common/common.enum';
import { WechatSettingService } from '../../setting';
import { CommonService } from '@app/common/common.service';
import { WechatOfficialAccountService } from '@shared/wechat';

export class WechatMaterialImageService extends BaseService {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(HttpService)
    private httpService: HttpService,
    @Inject(WechatSettingService)
    private wechatSettingService: WechatSettingService,
    @Inject(WechatOfficialAccountService)
    private officialAccountService: WechatOfficialAccountService,
    @InjectService(CommonResourceEntity)
    private resourceEntityService: OrmService<CommonResourceEntity>,
    @InjectService(WechatMaterialEntity)
    private materialEntityService: OrmService<WechatMaterialEntity>,
  ) {
    super();
  }

  /**
   * 上传微信图片素材
   * @param param0
   * @param param1
   */
  async create({
    body,
    target,
    id,
    userId,
    isThrow = true,
  }: {
    target: CommonTerminalEnum;
    id: number;
    body: WechatMaterialImageDTO;
    isThrow?: boolean;
    userId: number;
  }) {
    const { resourceId, name } = body;
    const officialAccountConfig = await this.wechatSettingService.getOfficialAccount(
      target,
      id,
    );
    const condition = this.commonService.getTerminalCondition(target, id);
    const material = await this.materialEntityService.findOne({
      where: {
        resourceId,
        appid: officialAccountConfig.appId,
        fileType: WechatMaterialFileTypeEnum.IMAGE,
        ...condition,
      },
    });
    if (material) {
      if (!isThrow) {
        return material;
      }
      throw new WechatMaterialAddImageException({
        msg: '当前图片素材已存在，请勿重复添加',
      });
    }
    return this.uploadImage({ name, resourceId, target, id, userId });
  }

  /**
   * 修改微信图片素材
   * @param param0
   * @param param1
   */
  async update(
    materialId: number,
    {
      body,
      target,
      id,
      userId,
    }: {
      target: CommonTerminalEnum;
      id: number;
      body: WechatMaterialImageDTO;
      userId;
    },
  ) {
    const { resourceId, name } = body;
    const condition = this.commonService.getTerminalCondition(target, id);
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      id,
    );
    const [currentMaterial, material] = await Promise.all([
      this.materialEntityService.findOne({
        where: {
          id: materialId,
          ...condition,
          fileType: WechatMaterialFileTypeEnum.IMAGE,
        },
      }),
      this.materialEntityService.findOne({
        where: {
          resourceId,
          ...condition,
          appid: config.appId,
          fileType: WechatMaterialFileTypeEnum.IMAGE,
        },
      }),
    ]);
    if (material && material.id !== materialId) {
      throw new WechatMaterialAddImageException({
        msg: '当前图片素材已存在，请勿重复添加',
      });
    }
    const account = this.officialAccountService.getAccount(config);
    // 删除当前素材
    await account.material.delete(currentMaterial.mediaId);
    // 上传图片素材
    return this.uploadImage({
      materialId,
      name,
      resourceId,
      target,
      id,
      userId,
    });
  }

  /**
   * 上传图片素材
   * @param resource
   * @param merchantId
   */
  async uploadImage({
    materialId,
    name,
    resourceId,
    target,
    id,
    userId,
  }: {
    materialId?: number;
    name: string;
    target: CommonTerminalEnum;
    resourceId: number;
    id: number;
    userId: number;
  }): Promise<WechatMaterialEntity> {
    const condition = this.commonService.getTerminalCondition(target, id);
    const resource = await this.resourceEntityService.findOne({
      where: {
        id: resourceId,
        ...condition,
      },
    });
    if (!resource?.id) {
      throw new WechatMaterialAddImageException({
        msg: '资源图片不存在',
      });
    }
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      id,
    );
    const account = this.officialAccountService.getAccount(config);
    const imageBuffer = await this.readRemoteImg(resource);
    const mediaResp = await account.material.uploadImage(imageBuffer);
    if (!mediaResp?.mediaId) {
      throw new WechatMaterialAddImageException({
        msg: mediaResp.errmsg,
      });
    }
    if (materialId) {
      return this.materialEntityService.updateOne(
        {
          name,
          appid: config.appId,
          fileType: WechatMaterialFileTypeEnum.IMAGE,
          url: mediaResp.url,
          resourceId: resource.id,
          mediaId: mediaResp.mediaId,
        },
        {
          ...condition,
          id: materialId,
        },
        userId,
      );
    }
    return this.materialEntityService.create(
      {
        name,
        ...condition,
        appid: config.appId,
        fileType: WechatMaterialFileTypeEnum.IMAGE,
        url: mediaResp.url,
        resourceId: resource.id,
        mediaId: mediaResp.mediaId,
      },
      userId,
    );
  }

  /**
   * 读取远程图片
   * @param url
   */
  async readRemoteImg(resource: CommonResourceEntity) {
    if (!lodash.isString(resource?.url)) {
      throw new WechatMaterialAddImageException({
        msg: '正确文件地址格式错误',
      });
    }
    if (!['.jpeg', '.png', '.jpg', '.gif'].includes(resource?.extension)) {
      throw new WechatMaterialAddImageException({
        msg: '图片素材仅支持jpeg/png/jpg/gif格式',
      });
    }
    resource.url = resource.url.replace('https://', 'http://');
    const { data } = await this.httpService.axiosRef.request({
      method: 'GET',
      url: encodeURI(resource?.url),
      responseType: 'stream',
    });
    return data;
  }
}
