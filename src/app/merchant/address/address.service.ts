import { Injectable } from '@nestjs/common';
import { MerchantAddressEntity } from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  ModifyMerchantAddressDTO,
  MerchantAddressListDTO,
} from './address.dto';
import { InjectService } from '@jiaxinjiang/nest-orm';
import { OrmService } from '@typeorm/orm.service';

@Injectable()
export class MerchantAddressService extends BaseService {
  constructor(
    @InjectService(MerchantAddressEntity)
    private addressEntityService: OrmService<MerchantAddressEntity>,
  ) {
    super();
  }

  /**
   * 获退货地址列表
   * @param param0
   * @param param1
   */
  async list(
    { pageIndex, pageSize }: MerchantAddressListDTO,
    { merchantId }: MerchantIdentity,
  ) {
    return this.addressEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        merchantId,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  /**
   * 获取退货地址详情
   * @param id
   * @param param1
   */
  async detail(id: number, { merchantId }: MerchantIdentity) {
    return this.addressEntityService.findOne({
      where: {
        id,
        merchantId,
      },
    });
  }

  /**
   * 创建退货地址
   * @param data
   * @param param1
   */
  async create(
    data: ModifyMerchantAddressDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    return this.addressEntityService.create(
      {
        ...data,
        merchantId,
      },
      user.id,
    );
  }

  /**
   * 修改退货地址
   * @param data
   * @param param1
   */
  async update(
    id: number,
    data: ModifyMerchantAddressDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    await this.addressEntityService.update(
      {
        ...data,
      },
      {
        id,
        merchantId,
      },
      user.id,
    );
    return true;
  }

  /**
   * 删除退货地址
   * @param id
   * @param param1
   * @param addressRepo
   * @param addressRuleRepo
   */
  async delete(id: number, { user, merchantId }: MerchantIdentity) {
    await this.addressEntityService.delete(
      {
        id,
        merchantId,
      },
      user.id,
    );
    return true;
  }
}
