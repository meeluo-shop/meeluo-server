import { BaseService } from '@app/app.service';
import { InjectService } from '@jiaxinjiang/nest-orm/dist';
import { Inject, Injectable } from '@nestjs/common';
import {
  IsMerchantUserDefaultAddressEnum,
  MerchantUserAddressEntity,
} from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import { RegionService } from '@app/common/region/region.service';
import {
  ClientAddressModifyParamDTO,
  ClientAddressInfoDTO,
} from './address.dto';

@Injectable()
export class ClientAddressService extends BaseService {
  constructor(
    @Inject(RegionService)
    private regionService: RegionService,
    @InjectService(MerchantUserAddressEntity)
    private addressEntityService: OrmService<MerchantUserAddressEntity>,
  ) {
    super();
  }

  /**
   * 获取收货地址列表
   * @param param0
   */
  async list({ merchantId, userId }: ClientIdentity) {
    const addressList: ClientAddressInfoDTO[] = await this.addressEntityService.find(
      {
        where: {
          merchantId,
          merchantUserId: userId,
        },
      },
    );
    const regionCodes: number[] = [];
    addressList.forEach(({ provinceCode, cityCode, countyCode }) =>
      regionCodes.push(provinceCode, cityCode, countyCode),
    );
    // 获取省份、城市、乡镇名称
    const regionData = this.regionService.getRegionNameByCodes(regionCodes);
    addressList.forEach(address => {
      address.provinceName = regionData[address.provinceCode];
      address.cityName = regionData[address.cityCode];
      address.countyName = regionData[address.countyCode];
    });
    return addressList;
  }

  /**
   * 新增收货地址
   * @param body
   * @param identity
   */
  async create(body: ClientAddressModifyParamDTO, identity: ClientIdentity) {
    const { merchantId, userId } = identity;
    if (body.isDefault) {
      await this.clearDefaultAddress(identity);
    }
    return this.addressEntityService.create(
      {
        ...body,
        merchantId,
        merchantUserId: userId,
      },
      userId,
    );
  }

  /**
   * 修改收货地址
   * @param id
   * @param body
   * @param param2
   */
  async update(
    id: number,
    body: ClientAddressModifyParamDTO,
    identity: ClientIdentity,
  ) {
    const { merchantId, userId } = identity;
    if (body.isDefault) {
      await this.clearDefaultAddress(identity);
    }
    await this.addressEntityService.update(
      {
        ...body,
      },
      {
        id,
        merchantId,
        merchantUserId: userId,
      },
      userId,
    );
    return true;
  }

  /**
   * 删除收货地址
   * @param id
   * @param param1
   */
  async delete(id: number, { merchantId, userId }: ClientIdentity) {
    await this.addressEntityService.delete(
      {
        id,
        merchantId,
        merchantUserId: userId,
      },
      userId,
    );
    return true;
  }

  /**
   * 清空用户默认地址
   * @param param0
   */
  private async clearDefaultAddress({ merchantId, userId }: ClientIdentity) {
    return this.addressEntityService.update(
      {
        isDefault: IsMerchantUserDefaultAddressEnum.FALSE,
      },
      {
        isDefault: IsMerchantUserDefaultAddressEnum.TRUE,
        merchantId,
        merchantUserId: userId,
      },
      userId,
    );
  }
}
