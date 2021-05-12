import { Injectable } from '@nestjs/common';
import { MerchantRechargePlanEntity } from '@typeorm/meeluoShop';
import { InjectService, In } from '@jiaxinjiang/nest-orm';
import {
  ModifyMerchantRechargePlanDTO,
  MerchantRechargePlanListDTO,
} from './plan.dto';
import { OrmService } from '@typeorm/orm.service';

@Injectable()
export class MerchantRechargePlanService {
  constructor(
    @InjectService(MerchantRechargePlanEntity)
    private rechargePlanEntityService: OrmService<MerchantRechargePlanEntity>,
  ) {}

  /**
   * 添加充值套餐
   * @param data
   * @param param1
   */
  async addRechargePlan(
    data: ModifyMerchantRechargePlanDTO,
    { merchantId, user }: MerchantIdentity,
  ) {
    return this.rechargePlanEntityService.create(
      {
        ...data,
        merchantId,
      },
      user.id,
    );
  }

  /**
   * 修改充值套餐
   * @param data
   * @param param1
   */
  async updateRechargePlan(
    id: number,
    data: ModifyMerchantRechargePlanDTO,
    { merchantId, user }: MerchantIdentity,
  ) {
    return this.rechargePlanEntityService.update(
      data,
      {
        id,
        merchantId,
      },
      user.id,
    );
  }

  /**
   * 删除用户充值套餐
   * @param ids
   * @param param1
   */
  async deleteRechargePlan(
    ids: number[],
    { merchantId, user }: MerchantIdentity,
  ) {
    await this.rechargePlanEntityService.delete(
      {
        merchantId,
        id: In(ids),
      },
      user.id,
    );
    return true;
  }

  /**
   * 获取用户充值套餐列表
   * @param param0
   * @param param1
   */
  async getRechargePlanList(
    { pageIndex, pageSize }: MerchantRechargePlanListDTO,
    merchantId: number,
  ) {
    return this.rechargePlanEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        merchantId,
      },
      order: {
        order: 'ASC',
      },
    });
  }

  /**
   * 获取用户充值套餐详情
   * @param id
   * @param param1
   */
  async getRechargePlanDetail(id: number, { merchantId }: MerchantIdentity) {
    return this.rechargePlanEntityService.findOne({
      where: {
        id,
        merchantId,
      },
    });
  }
}
