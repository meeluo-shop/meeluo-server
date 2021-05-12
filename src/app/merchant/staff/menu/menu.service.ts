import { Injectable } from '@nestjs/common';
import { InjectService, In } from '@jiaxinjiang/nest-orm';
import { MerchantStaffMenuEntity } from '@typeorm/meeluoShop';
import {
  MerchantMenuListDTO,
  MerchantMenuIdListDTO,
  MerchantCreateMenuDTO,
  MerchantUpdateMenuDTO,
} from './menu.dto';
import { MerchantCodeExistsException } from './menu.exception';
import { OrmService } from '@typeorm/orm.service';

@Injectable()
export class MerchantStaffMenuService {
  constructor(
    @InjectService(MerchantStaffMenuEntity)
    private menuEntityService: OrmService<MerchantStaffMenuEntity>,
  ) {}

  /**
   * 获取导航列表
   * @param param0
   */
  async list(
    {
      pageIndex,
      pageSize,
      name,
      code,
      isCategory,
      categoryId,
    }: MerchantMenuListDTO,
    { merchantId }: MerchantIdentity,
  ) {
    return this.menuEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        merchantId,
        isCategory,
        categoryId,
        name_contains: name,
        code_contains: code,
      },
      order: {
        order: 'ASC',
      },
    });
  }

  /**
   * 获取导航详情
   * @param id
   */
  async detail(id: number, { merchantId }: MerchantIdentity) {
    return this.menuEntityService.findOne({
      where: { id, merchantId },
    });
  }

  /**
   * 删除导航
   * @param param0
   */
  async delete(
    { ids }: MerchantMenuIdListDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    await this.menuEntityService.delete(
      {
        merchantId,
        id: In(ids),
      },
      user.id,
    );
    return true;
  }

  /**
   * 创建导航
   * @param data
   * @param param1
   */
  async create(
    data: MerchantCreateMenuDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    // 检查编号是否存在
    const count = await this.menuEntityService.count({
      merchantId,
      code: data.code,
    });
    if (count) {
      throw new MerchantCodeExistsException();
    }
    return this.menuEntityService.create(
      {
        ...data,
        merchantId,
      },
      user.id,
    );
  }

  /**
   * 修改导航
   * @param id
   * @param data
   * @param param2
   */
  async update(
    id: number,
    data: MerchantUpdateMenuDTO,
    { merchantId, user }: MerchantIdentity,
  ) {
    const adminMenu = await this.menuEntityService.findOne({
      select: ['id'],
      where: { merchantId, code: data.code },
    });
    // 检查编号是否存在
    if (adminMenu && adminMenu.id !== id) {
      throw new MerchantCodeExistsException();
    }
    await this.menuEntityService.updateById(data, id, user.id);
    return true;
  }
}
