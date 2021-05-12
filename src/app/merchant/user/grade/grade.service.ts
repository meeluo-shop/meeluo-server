import { Injectable } from '@nestjs/common';
import {
  ModifyMerchantUserGradeDTO,
  MerchantUserGradeListDTO,
} from './grade.dto';
import {
  InjectService,
  Transaction,
  TransactionRepository,
  Repository,
  FindConditions,
  In,
  Not,
} from '@jiaxinjiang/nest-orm';
import {
  MerchantUserGradeEntity,
  IsMerchantUserDefaultGradeEnum,
  MerchantUserEntity,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { OrmService } from '@typeorm/orm.service';
import { MerchantUserGradeWeightExistsException } from './grade.exception';

@Injectable()
export class MerchantUserGradeService extends BaseService {
  constructor(
    @InjectService(MerchantUserGradeEntity)
    private gradeEntityService: OrmService<MerchantUserGradeEntity>,
  ) {
    super();
  }

  /**
   * 创建用户会员等级
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async create(
    data: ModifyMerchantUserGradeDTO,
    { user, merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantUserGradeEntity)
    gradeRepo?: Repository<MerchantUserGradeEntity>,
  ) {
    const gradeEntityService = this.getService<
      MerchantUserGradeEntity,
      OrmService<MerchantUserGradeEntity>
    >(gradeRepo);
    // 检查会员等级是否已存在
    const count = await this.gradeEntityService.count({
      merchantId,
      weight: data.weight,
    });
    if (count) {
      throw new MerchantUserGradeWeightExistsException();
    }
    // 一个商户下只能有一个默认会员等级
    if (data.isDefault) {
      await gradeEntityService.update(
        {
          isDefault: IsMerchantUserDefaultGradeEnum.FALSE,
        },
        {
          merchantId,
        },
        user.id,
      );
    }
    return gradeEntityService.create(
      {
        ...data,
        merchantId,
      },
      user.id,
    );
  }

  /**
   * 修改用户会员等级
   * @param id
   * @param data
   * @param param2
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async update(
    id: number,
    data: ModifyMerchantUserGradeDTO,
    { user, merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantUserGradeEntity)
    gradeRepo?: Repository<MerchantUserGradeEntity>,
  ) {
    const gradeEntityService = this.getService<
      MerchantUserGradeEntity,
      OrmService<MerchantUserGradeEntity>
    >(gradeRepo);
    // 检查会员等级是否已存在
    const count = await this.gradeEntityService.count({
      merchantId,
      weight: data.weight,
      id: Not(id),
    });
    if (count) {
      throw new MerchantUserGradeWeightExistsException();
    }
    // 一个商户下只能有一个默认会员等级
    if (data.isDefault) {
      await gradeEntityService.update(
        {
          isDefault: IsMerchantUserDefaultGradeEnum.FALSE,
        },
        {
          merchantId,
        },
        user.id,
      );
    }
    await gradeEntityService.update(
      data,
      {
        id,
        merchantId,
      },
      user.id,
    );
    return true;
  }

  /**
   * 获取用户会员等级详情
   * @param id
   * @param param1
   */
  async detail(id: number, { merchantId }: MerchantIdentity) {
    return this.gradeEntityService.findOne({
      where: {
        id,
        merchantId,
      },
    });
  }

  /**
   * 删除用户会员等级
   * @param id
   * @param param1
   */
  async delete(id: number, { user, merchantId }: MerchantIdentity) {
    await this.gradeEntityService.delete(
      {
        id,
        merchantId,
      },
      user.id,
    );
    return true;
  }

  /**
   * 获取用户会员等级列表
   * @param param0
   * @param param1
   */
  async list(
    { pageIndex, pageSize }: MerchantUserGradeListDTO,
    merchantId: number,
  ) {
    return this.gradeEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        merchantId,
      },
      order: {
        weight: 'ASC',
      },
    });
  }

  /**
   * 判断会员是否升级
   * @param totalRecharge
   */
  async getUpgradeGrade(totalRecharge: number, merchantId: number) {
    const gradeList = await this.gradeEntityService.find({
      take: 1,
      where: {
        merchantId,
        upgrade_lte: totalRecharge,
      },
      order: {
        weight: 'DESC',
      },
    });
    return gradeList.length > 0 ? gradeList[0] : null;
  }

  async bindUsersGrade(
    entitys: MerchantUserEntity,
    merchantId: number,
  ): Promise<MerchantUserEntity>;
  async bindUsersGrade(
    entitys: MerchantUserEntity[],
    merchantId: number,
  ): Promise<MerchantUserEntity[]>;
  async bindUsersGrade(
    entitys: MerchantUserEntity | MerchantUserEntity[],
    merchantId: number,
  ): Promise<MerchantUserEntity | MerchantUserEntity[]> {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets = Array.isArray(entitys) ? entitys : [entitys];
    const gradeIds = Array.from(new Set(targets.map(user => user.gradeId)));
    // 额外查询用户对应的会员等级
    const gradeWhere: FindConditions<MerchantUserGradeEntity>[] = [
      {
        merchantId,
        isDefault: IsMerchantUserDefaultGradeEnum.TRUE,
      },
      { merchantId, id: In(gradeIds.length ? gradeIds : [null]) },
    ];
    const grades = await this.gradeEntityService.find({ where: gradeWhere });
    const defaultGrade =
      grades.find(
        item => item.isDefault === IsMerchantUserDefaultGradeEnum.TRUE,
      ) || null;
    targets.forEach(user => {
      user.grade =
        grades.find(item => item.id === user.gradeId) || defaultGrade;
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }
}
