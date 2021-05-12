import { Injectable, Inject } from '@nestjs/common';
import { InjectService } from '@jiaxinjiang/nest-orm';
import { AdminGameCategoryEntity, AdminGameEntity } from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  ModifyAdminGameCategoryDTO,
  AdminGameCategoryListDTO,
} from './category.dto';
import {
  AdminGameCategoryHasGameException,
  AdminGameCategoryHasChildrenException,
} from './category.exception';
import { OrmService } from '@typeorm/orm.service';
import { ResourceService } from '@app/common/resource';

@Injectable()
export class AdminGameCategoryService extends BaseService {
  constructor(
    @Inject(ResourceService)
    private resourceService: ResourceService,
    @InjectService(AdminGameEntity)
    private gameEntityService: OrmService<AdminGameEntity>,
    @InjectService(AdminGameCategoryEntity)
    private categoryEntityService: OrmService<AdminGameCategoryEntity>,
  ) {
    super();
  }

  /**
   * 获取游戏分类列表
   * @param param0
   * @param param1
   */
  async list({ pageIndex, pageSize, superiorId }: AdminGameCategoryListDTO) {
    const result = await this.categoryEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        superiorId,
      },
      order: {
        order: 'ASC',
      },
    });
    await this.resourceService.bindTargetResource(
      result.rows,
      'image',
      'imageId',
    );
    return {
      rows: this.clearExtraFields(result.rows, true),
      count: result.count,
    };
    return result;
  }

  /**
   * 创建游戏分类
   * @param data
   * @param param1
   */
  async create(data: ModifyAdminGameCategoryDTO, { user }: AdminIdentity) {
    return this.categoryEntityService.create(
      {
        ...data,
      },
      user.id,
    );
  }

  /**
   * 修改游戏分类
   * @param id
   * @param data
   * @param param2
   */
  async update(
    id: number,
    data: ModifyAdminGameCategoryDTO,
    { user }: AdminIdentity,
  ) {
    await this.categoryEntityService.updateById(data, id, user.id);
    return true;
  }

  /**
   * 获取游戏分类详情
   * @param id
   * @param param1
   */
  async detail(id: number) {
    const detail = await this.categoryEntityService.findById(id);
    await this.resourceService.bindTargetResource(detail, 'image', 'imageId');
    return detail;
  }

  /**
   * 删除游戏分类
   * @param id
   * @param param1
   */
  async delete(id: number, { user }: AdminIdentity) {
    const gameCount = await this.gameEntityService.count({
      categoryId: id,
    });
    if (gameCount) {
      throw new AdminGameCategoryHasGameException();
    }
    const subCount = await this.categoryEntityService.count({
      superiorId: id,
    });
    if (subCount) {
      throw new AdminGameCategoryHasChildrenException();
    }
    await this.categoryEntityService.deleteById(id, user.id);
    return true;
  }
}
