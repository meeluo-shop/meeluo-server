import { Injectable } from '@nestjs/common';
import {
  InjectService,
  In,
  Transaction,
  TransactionRepository,
  Repository,
} from '@jiaxinjiang/nest-orm';
import { AdminPermEntity, AdminIsSystemPermEnum } from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  AdminPermListDTO,
  AdminPermIdListDTO,
  AdminCreatePermDTO,
  AdminUpdatePermDTO,
} from './permission.dto';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { AdminCodeExistsException } from './permission.exception';
import { permissions } from './permission.data';
import { OrmService } from '@typeorm/orm.service';
import { IsDeleteEnum } from '@typeorm/base.entity';

@Injectable()
export class AdminPermissionService extends BaseService {
  constructor(
    @InjectService(AdminPermEntity)
    private permEntityService: OrmService<AdminPermEntity>,
  ) {
    super();
  }

  /**
   * 获取数据权限列表
   * @param param0
   */
  async list({
    pageIndex,
    pageSize,
    name,
    code,
    isCategory,
    categoryId,
  }: AdminPermListDTO) {
    const orQuery = {
      isDelete: IsDeleteEnum.FALSE,
      isCategory,
      categoryId,
    };
    return this.permEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: [
        {
          ...orQuery,
          name_contains: name,
        },
        {
          ...orQuery,
          code_contains: code,
        },
      ],
      order: {
        id: 'DESC',
      },
    });
  }

  /**
   * 获取权限详情
   * @param id
   */
  async detail(id: number) {
    return this.permEntityService.findById(id);
  }

  /**
   * 删除权限
   * @param param0
   */
  async delete({ ids }: AdminPermIdListDTO, { user }: AdminIdentity) {
    await this.permEntityService.delete(
      {
        systemPerm: AdminIsSystemPermEnum.FALSE,
        id: In(ids),
      },
      user.id,
    );
    return true;
  }

  /**
   * 创建权限
   * @param data
   * @param param1
   */
  async create(data: AdminCreatePermDTO, { user }: AdminIdentity) {
    // 检查编号是否存在
    const count = await this.permEntityService.count({ code: data.code });
    if (count) {
      throw new AdminCodeExistsException();
    }
    return this.permEntityService.create(data, user.id);
  }

  /**
   * 修改权限
   * @param id
   * @param data
   * @param param2
   */
  async update(id: number, data: AdminUpdatePermDTO, { user }: AdminIdentity) {
    const adminPerm = await this.permEntityService.findOne({
      select: ['id'],
      where: {
        systemPerm: AdminIsSystemPermEnum.FALSE,
        code: data.code,
      },
    });
    // 检查编号是否存在
    if (adminPerm && adminPerm.id !== id) {
      throw new AdminCodeExistsException();
    }
    await this.permEntityService.updateById(data, id, user.id);
    return true;
  }

  /**
   * 项目启动时，自动更新数据库里的权限字段
   * @param data
   * @param adminPermRepostory
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async initPermission(
    @TransactionRepository(AdminPermEntity)
    adminPermRepostory?: Repository<AdminPermEntity>,
  ) {
    const codes: string[] = permissions.map(item => {
      item.systemPerm = AdminIsSystemPermEnum.TRUE;
      return item.code;
    });
    const adminPermService = this.getService<
      AdminPermEntity,
      OrmService<AdminPermEntity>
    >(adminPermRepostory);
    const perms = await adminPermService.find({
      select: ['code'],
      where: {
        code_in: codes,
      },
    });
    const noRepeatCodes = permissions.filter(
      item => !perms.find(perm => perm.code === item.code),
    );
    await adminPermService.createMany(noRepeatCodes, 0);
  }
}
