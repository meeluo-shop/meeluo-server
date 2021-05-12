import { Injectable } from '@nestjs/common';
import { InjectService, In } from '@jiaxinjiang/nest-orm';
import { AdminMenuEntity } from '@typeorm/meeluoShop';
import {
  AdminMenuListDTO,
  AdminMenuIdListDTO,
  AdminCreateMenuDTO,
  AdminUpdateMenuDTO,
} from './menu.dto';
import { AdminCodeExistsException } from './menu.exception';
import { OrmService } from '@typeorm/orm.service';

@Injectable()
export class AdminMenuService {
  constructor(
    @InjectService(AdminMenuEntity)
    private menuEntityService: OrmService<AdminMenuEntity>,
  ) {}

  /**
   * 获取导航列表
   * @param param0
   */
  async list({
    pageIndex,
    pageSize,
    name,
    code,
    isCategory,
    categoryId,
  }: AdminMenuListDTO) {
    return this.menuEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
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
  async detail(id: number) {
    return this.menuEntityService.findById(id);
  }

  /**
   * 删除导航
   * @param param0
   */
  async delete({ ids }: AdminMenuIdListDTO, { user }: AdminIdentity) {
    await this.menuEntityService.delete(
      {
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
  async create(data: AdminCreateMenuDTO, { user }: AdminIdentity) {
    // 检查编号是否存在
    const count = await this.menuEntityService.count({ code: data.code });
    if (count) {
      throw new AdminCodeExistsException();
    }
    return this.menuEntityService.create(data, user.id);
  }

  /**
   * 修改导航
   * @param id
   * @param data
   * @param param2
   */
  async update(id: number, data: AdminUpdateMenuDTO, { user }: AdminIdentity) {
    const adminMenu = await this.menuEntityService.findOne({
      select: ['id'],
      where: { code: data.code },
    });
    // 检查编号是否存在
    if (adminMenu && adminMenu.id !== id) {
      throw new AdminCodeExistsException();
    }
    await this.menuEntityService.updateById(data, id, user.id);
    return true;
  }
}
