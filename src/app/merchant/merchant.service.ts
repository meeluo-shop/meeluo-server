import { Inject, Injectable } from '@nestjs/common';
import { In, InjectService } from '@jiaxinjiang/nest-orm';
import { MerchantBaseEntity, MerchantEntity } from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import { ModifyMerchantDTO } from './merchant.dto';
import { OrmService } from '@typeorm/orm.service';
import { RegionService } from '@app/common/region/region.service';

@Injectable()
export class MerchantService extends BaseService {
  constructor(
    @Inject(RegionService)
    private regionService: RegionService,
    @InjectService(MerchantEntity)
    private merchantEntityService: OrmService<MerchantEntity>,
  ) {
    super();
  }

  static merchantFields: Array<keyof MerchantEntity> = [
    'logo',
    'doorPhoto',
    'address',
    'cityCode',
    'countyCode',
    'provinceCode',
    'isActive',
    'latitude',
    'longitude',
    'name',
    'phone',
    'storeDesc',
    'storeName',
    'allowPrivateWechat',
    'type',
  ];

  /**
   * 获取商户详情
   * @param param0
   */
  async detail(merchantId: number, allFields = true) {
    const merchant = await this.merchantEntityService.findById(merchantId, {
      select: allFields ? undefined : MerchantService.merchantFields,
    });
    return this.bindMerchantRegionName(merchant);
  }

  /**
   * 更新商户信息
   * @param data
   * @param param1
   */
  async update(
    data: ModifyMerchantDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    await this.merchantEntityService.updateById(data, merchantId, user.id);
    return true;
  }

  /**
   * 给目标数据绑定商家信息
   * @param entitys
   */
  async bindMerchant<T extends MerchantBaseEntity>(entitys: T): Promise<T>;
  async bindMerchant<T extends MerchantBaseEntity>(entitys: T[]): Promise<T[]>;
  async bindMerchant<T extends MerchantBaseEntity>(entitys: T | T[]) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets: T[] = Array.isArray(entitys) ? entitys : [entitys];
    const merchantIds = Array.from(
      new Set(targets.map(item => item.merchantId)),
    );
    const merchants = await this.merchantEntityService.find({
      select: MerchantService.merchantFields,
      where: { id: In(merchantIds.length ? merchantIds : [null]) },
    });
    targets.forEach(target => {
      target.merchant =
        merchants.find(item => item.id === target.merchantId) || null;
    });
    this.bindMerchantRegionName(merchants);
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 给商户绑定地区名称
   * @param entitys
   */
  bindMerchantRegionName(entitys: MerchantEntity): MerchantEntity;
  bindMerchantRegionName(entitys: MerchantEntity[]): MerchantEntity[];
  bindMerchantRegionName(entitys: MerchantEntity | MerchantEntity[]) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const regionCodes: number[] = [];
    targets.forEach(target => {
      const { provinceCode, countyCode, cityCode } = target;
      regionCodes.push(provinceCode, cityCode, countyCode);
    });
    if (regionCodes.length) {
      // 获取省份、城市、乡镇名称
      const regionData = this.regionService.getRegionNameByCodes(regionCodes);
      targets.forEach(target => {
        const { provinceCode, countyCode, cityCode } = target;
        target.provinceName = regionData[provinceCode];
        target.cityName = regionData[cityCode];
        target.countyName = regionData[countyCode];
      });
    }
    return Array.isArray(entitys) ? targets : targets[0];
  }
}
