import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import { InjectService } from '@jiaxinjiang/nest-orm';
import {
  WechatKeywordEntity,
  WechatKeywordMsgTypeEnum,
} from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { WechatKeywordDTO, WechatKeywordListDTO } from './keyword.dto';
import { WechatMaterialService } from '../../material';
import { WechatAddKeywordException } from './keyword.exception';
import { CommonService } from '@app/common/common.service';
import { WechatSettingService } from '../../setting';
import { WechatOfficialAccountService } from '@shared/wechat';
import { CommonTerminalEnum } from '@app/common/common.enum';

@Injectable()
export class WechatKeywordService extends BaseService {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatSettingService)
    private wechatSettingService: WechatSettingService,
    @Inject(WechatOfficialAccountService)
    private officialAccountService: WechatOfficialAccountService,
    @Inject(WechatMaterialService)
    private materialService: WechatMaterialService,
    @InjectService(WechatKeywordEntity)
    private keywordEntityService: OrmService<WechatKeywordEntity>,
  ) {
    super();
  }

  /**
   * 检验图文消息参数是否正确
   * @param body
   */
  async checkNewsParams(body: WechatKeywordDTO) {
    const { type, title, introduction, imageUrl, linkUrl } = body;
    if (type === WechatKeywordMsgTypeEnum.NEWS) {
      if (!title) {
        throw new WechatAddKeywordException({ msg: '图文标题不能为空' });
      }
      if (!introduction) {
        throw new WechatAddKeywordException({ msg: '图文描述不能为空' });
      }
      if (!imageUrl) {
        throw new WechatAddKeywordException({ msg: '图片地址不能为空' });
      }
      if (!linkUrl) {
        throw new WechatAddKeywordException({ msg: '图文链接不能为空' });
      }
    }
    return true;
  }

  /**
   * 新增关键字回复
   * @param body
   * @param param1
   */
  async create(
    body: WechatKeywordDTO,
    userId: number,
    target: CommonTerminalEnum,
    terminalId: number,
  ) {
    const { materialId, type } = body;
    this.checkNewsParams(body);
    const condition = this.commonService.getTerminalCondition(
      target,
      terminalId,
    );
    await this.materialService.checkMediaIdType(
      materialId,
      type,
      target,
      terminalId,
    );
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      terminalId,
    );
    return this.keywordEntityService.create(
      {
        appid: config.appId,
        ...body,
        ...condition,
      },
      userId,
    );
  }

  /**
   * 修改关键字回复
   * @param id
   * @param body
   * @param param2
   */
  async update(
    id: number,
    body: WechatKeywordDTO,
    userId: number,
    target: CommonTerminalEnum,
    terminalId: number,
  ) {
    this.checkNewsParams(body);
    const condition = this.commonService.getTerminalCondition(
      target,
      terminalId,
    );
    await this.materialService.checkMediaIdType(
      body.materialId,
      body.type,
      target,
      terminalId,
    );
    return this.keywordEntityService.updateOne(
      {
        ...body,
      },
      {
        id,
        ...condition,
      },
      userId,
    );
  }

  /**
   * 获取关键字回复列表
   * @param param0
   * @param param1
   */
  async list(
    { pageIndex, pageSize }: WechatKeywordListDTO,
    target: CommonTerminalEnum,
    terminalId: number,
  ) {
    const condition = this.commonService.getTerminalCondition(
      target,
      terminalId,
    );
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      terminalId,
    );
    return this.keywordEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        ...condition,
        appid: config.appId,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  /**
   * 获取关键字回复详情
   * @param param0
   * @param param1
   */
  async detail(id: number, target: CommonTerminalEnum, terminalId: number) {
    const condition = this.commonService.getTerminalCondition(
      target,
      terminalId,
    );
    const keyword = await this.keywordEntityService.findOne({
      where: {
        id,
        ...condition,
      },
    });
    if (keyword.materialId) {
      keyword.material = await this.materialService.detail({
        id: keyword.materialId,
        target,
        terminalId,
      });
    }
    return keyword;
  }

  /**
   * 删除关键字回复
   * @param param0
   * @param param1
   */
  async delete(
    id: number,
    userId: number,
    target: CommonTerminalEnum,
    terminalId: number,
  ) {
    const condition = this.commonService.getTerminalCondition(
      target,
      terminalId,
    );
    await this.keywordEntityService.delete(
      {
        id,
        ...condition,
      },
      userId,
    );
    return true;
  }
}
