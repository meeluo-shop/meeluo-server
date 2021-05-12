import { Inject } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import {
  Repository,
  Transaction,
  TransactionRepository,
} from '@jiaxinjiang/nest-orm';
import {
  WechatMaterialEntity,
  WechatMaterialFileTypeEnum,
  WechatMaterialTextEntity,
} from '@typeorm/meeluoShop';
import { Article } from '@library/easyWechat/Core/Messages/Article';
import { WechatMaterialTextDTO } from './text.dto';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { WechatMaterialImageService } from '../image';
import { WechatMaterialGetTextException } from './text.exception';
import { WechatSettingService } from '../../setting';
import { CommonTerminalEnum } from '@app/common/common.enum';
import { WechatOfficialAccountService } from '@shared/wechat';
import { CommonService } from '@app/common/common.service';

export class WechatMaterialTextService extends BaseService {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatSettingService)
    private wechatSettingService: WechatSettingService,
    @Inject(WechatOfficialAccountService)
    private officialAccountService: WechatOfficialAccountService,
    @Inject(WechatMaterialImageService)
    private materialImageService: WechatMaterialImageService,
  ) {
    super();
  }

  /**
   * 创建图文素材
   * @param param0
   * @param identity
   * @param materialRepo
   * @param materialTextRepo
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async create(
    { name, textList, imageIds = [] }: WechatMaterialTextDTO,
    target: CommonTerminalEnum,
    terminalId: number,
    userId: number,
    @TransactionRepository(WechatMaterialEntity)
    materialRepo?: Repository<WechatMaterialEntity>,
    @TransactionRepository(WechatMaterialTextEntity)
    materialTextRepo?: Repository<WechatMaterialTextEntity>,
  ) {
    const materialEntityService = this.getService(materialRepo);
    const materialTextEntityService = this.getService(materialTextRepo);
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      terminalId,
    );
    for (const textInfo of textList) {
      imageIds.push(textInfo.resourceId);
    }
    imageIds = Array.from(new Set(imageIds)).filter(val => !!val);
    // 上传图片素材，会先判断是否存在，如果不存在则上传
    const materialImageList = await Promise.all(
      imageIds.map(id =>
        this.materialImageService.create({
          body: { resourceId: id, name },
          isThrow: false,
          target,
          id: terminalId,
          userId,
        }),
      ),
    );
    const articleList: Article[] = textList.map(
      text =>
        new Article({
          thumbMediaId: materialImageList.find(
            image => image.resourceId === text.resourceId,
          )?.mediaId,
          author: text.author,
          title: text.title,
          content: text.content,
          digest: text.digest,
          showCover: 1,
        }),
    );
    const condition = this.commonService.getTerminalCondition(
      target,
      terminalId,
    );
    const account = this.officialAccountService.getAccount(config);
    const material = await account.material.uploadArticle(articleList);
    // 创建图文素材集
    const materialEntity = await materialEntityService.create(
      {
        ...condition,
        appid: config.appId,
        name,
        mediaId: material.mediaId,
        fileType: WechatMaterialFileTypeEnum.TEXT,
      },
      userId,
    );
    // 创建图文素材
    await materialTextEntityService.createMany(
      textList.map((text, index) => {
        const materialImage = materialImageList.find(
          image => image.resourceId === text.resourceId,
        );
        return {
          ...condition,
          appid: config.appId,
          materialId: materialEntity.id,
          order: index + 1,
          title: text.title,
          author: text.author,
          digest: text.digest,
          content: text.content,
          mediaId: materialImage.mediaId,
          url: materialImage.url,
          resourceId: text.resourceId,
        };
      }),
      userId,
    );
    return materialEntity;
  }

  /**
   * 修改图文素材
   * @param id
   * @param param1
   * @param identity
   * @param materialRepo
   * @param materialTextRepo
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async update(
    id: number,
    { name, textList, imageIds = [] }: WechatMaterialTextDTO,
    userId: number,
    target: CommonTerminalEnum,
    terminalId: number,
    @TransactionRepository(WechatMaterialEntity)
    materialRepo?: Repository<WechatMaterialEntity>,
    @TransactionRepository(WechatMaterialTextEntity)
    materialTextRepo?: Repository<WechatMaterialTextEntity>,
  ) {
    const materialEntityService = this.getService(materialRepo);
    const materialTextEntityService = this.getService(materialTextRepo);
    const condition = this.commonService.getTerminalCondition(
      target,
      terminalId,
    );
    const config = await this.wechatSettingService.getOfficialAccount(
      target,
      terminalId,
    );
    const account = this.officialAccountService.getAccount(config);
    const material = await materialEntityService.findOne({
      where: {
        id,
        ...condition,
        appid: config.appId,
      },
    });
    if (!material) {
      throw new WechatMaterialGetTextException({
        msg: '无效的图文素材',
      });
    }
    for (const textInfo of textList) {
      imageIds.push(textInfo.resourceId);
    }
    imageIds = Array.from(new Set(imageIds)).filter(val => !!val);
    // 上传图片素材，会先判断是否存在，如果不存在则上传
    const materialImageList = await Promise.all(
      imageIds.map(id =>
        this.materialImageService.create({
          body: { resourceId: id, name },
          isThrow: false,
          userId,
          target,
          id: terminalId,
        }),
      ),
    );
    // 修改微信图文素材
    await Promise.all(
      textList.map((text, index) =>
        account.material.updateArticle(
          material.mediaId,
          new Article({
            thumbMediaId: materialImageList.find(
              image => image.resourceId === text.resourceId,
            )?.mediaId,
            author: text.author,
            title: text.title,
            content: text.content,
            digest: text.digest,
            showCover: 1,
          }),
          index,
        ),
      ),
    );
    // 修改图文素材集
    const materialEntity = await materialEntityService.updateOne(
      {
        name,
      },
      {
        id,
      },
      userId,
    );
    // 修改图文素材
    await Promise.all(
      textList.map((text, index) => {
        const materialImage = materialImageList.find(
          image => image.resourceId === text.resourceId,
        );
        return materialTextEntityService.updateOne(
          {
            title: text.title,
            author: text.author,
            digest: text.digest,
            content: text.content,
            mediaId: materialImage.mediaId,
            url: materialImage.url,
            resourceId: text.resourceId,
          },
          {
            materialId: id,
            order: index + 1,
          },
          userId,
        );
      }),
    );
    return materialEntity;
  }
}
