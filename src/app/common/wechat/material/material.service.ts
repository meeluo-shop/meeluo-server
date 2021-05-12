import {
  WechatKeywordMsgTypeEnum,
  WechatMaterialEntity,
  WechatMaterialFileTypeEnum,
  WechatMaterialTextEntity,
} from '@typeorm/meeluoShop';
import { Inject } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import { InjectService } from '@jiaxinjiang/nest-orm';
import { OrmService } from '@typeorm/orm.service';
import { WechatMaterialListDTO } from './material.dto';
import { ResourceService } from '@app/common/resource';
import { WechatMaterialTypeException } from './material.exception';
import { WechatSettingService } from '../setting';
import { CommonTerminalEnum } from '@app/common/common.enum';
import { CommonService } from '@app/common/common.service';
import { WechatOfficialAccountService } from '@shared/wechat';

export class WechatMaterialService extends BaseService {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(ResourceService)
    private resourceService: ResourceService,
    @Inject(WechatSettingService)
    private wechatSettingService: WechatSettingService,
    @Inject(WechatOfficialAccountService)
    private officialAccountService: WechatOfficialAccountService,
    @InjectService(WechatMaterialEntity)
    private materialEntityService: OrmService<WechatMaterialEntity>,
    @InjectService(WechatMaterialTextEntity)
    private materialTextEntityService: OrmService<WechatMaterialTextEntity>,
  ) {
    super();
  }

  messageTypeMapping = {
    [WechatKeywordMsgTypeEnum.NEWS]: WechatMaterialFileTypeEnum.TEXT,
    [WechatKeywordMsgTypeEnum.IMAGE]: WechatMaterialFileTypeEnum.IMAGE,
    [WechatKeywordMsgTypeEnum.VIDEO]: WechatMaterialFileTypeEnum.VIDEO,
    [WechatKeywordMsgTypeEnum.VOICE]: WechatMaterialFileTypeEnum.VOICE,
  };

  /**
   * 判断微信素材类型和消息类型是否匹配
   * @param mediaId
   * @param merchantId
   * @param type
   */
  async checkMediaIdType(
    materialId: number,
    type: WechatKeywordMsgTypeEnum,
    target: CommonTerminalEnum,
    terminalId: number,
  ) {
    if (!materialId) {
      return true;
    }
    const condition = this.commonService.getTerminalCondition(
      target,
      terminalId,
    );
    const material = await this.materialEntityService.findOne({
      where: {
        id: materialId,
        ...condition,
      },
    });
    if (this.messageTypeMapping[type] !== material?.fileType) {
      throw new WechatMaterialTypeException({
        msg: '素材类型与消息类型不匹配',
      });
    }
    return true;
  }

  /**
   * 获取微信素材列表
   * @param param0
   * @param param1
   */
  async list(
    type: WechatMaterialFileTypeEnum,
    { pageIndex, pageSize }: WechatMaterialListDTO,
    target: CommonTerminalEnum,
    id: number,
  ) {
    const officialAccountConfig = await this.wechatSettingService.getOfficialAccount(
      target,
      id,
    );
    const condition = this.commonService.getTerminalCondition(target, id);
    const materialList = await this.materialEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        ...condition,
        appid: officialAccountConfig.appId,
        fileType: type,
      },
      order: {
        id: 'DESC',
      },
    });
    if (type === WechatMaterialFileTypeEnum.IMAGE) {
      await this.resourceService.bindTargetResource(
        materialList.rows,
        'resource',
        'resourceId',
      );
    }
    return materialList;
  }

  /**
   * 删除微信素材
   * @param param0
   * @param param1
   */
  async delete({
    id,
    target,
    terminalId,
    userId,
  }: {
    id: number;
    target: CommonTerminalEnum;
    terminalId: number;
    userId: number;
  }) {
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      terminalId,
    );
    const condition = this.commonService.getTerminalCondition(
      target,
      terminalId,
    );
    const material = await this.materialEntityService.findOne({
      select: ['mediaId'],
      where: {
        id,
        ...condition,
        appid: config.appId,
      },
    });
    if (material) {
      const account = this.officialAccountService.getAccount(config);
      await account.material.delete(material.mediaId);
      await this.materialEntityService.deleteById(id, userId);
      return true;
    }
    return false;
  }

  /**
   * 获取微信素材
   * @param param0
   * @param param1
   */
  async detail({
    id,
    target,
    terminalId,
  }: {
    id: number;
    target: CommonTerminalEnum;
    terminalId: number;
  }) {
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      terminalId,
    );
    const condition = this.commonService.getTerminalCondition(
      target,
      terminalId,
    );
    const material = await this.materialEntityService.findOne({
      where: {
        id,
        ...condition,
        appid: config.appId,
      },
    });
    if (material?.fileType === WechatMaterialFileTypeEnum.IMAGE) {
      await this.resourceService.bindTargetResource(
        material,
        'resource',
        'resourceId',
      );
    }
    if (material?.fileType === WechatMaterialFileTypeEnum.VIDEO) {
      const account = this.officialAccountService.getAccount(config);
      const media = await account.material.get(material.mediaId);
      material.url = media?.['down_url'];
    }
    if (material?.fileType === WechatMaterialFileTypeEnum.TEXT) {
      material.materialTextList = await this.materialTextEntityService.find({
        where: {
          materialId: material.id,
        },
      });
      await this.resourceService.bindTargetResource(
        material.materialTextList,
        'resource',
        'resourceId',
      );
    }
    return material;
  }
}
