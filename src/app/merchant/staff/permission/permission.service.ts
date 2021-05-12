import { Injectable } from '@nestjs/common';
import {
  InjectService,
  Transaction,
  TransactionRepository,
  Repository,
} from '@jiaxinjiang/nest-orm';
import {
  MerchantStaffPermEntity,
  MerchantStaffIsSystemPermEnum,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import { MerchantPermListDTO } from './permission.dto';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import { permissions } from './permission.data';
import { OrmService } from '@typeorm/orm.service';

@Injectable()
export class MerchantStaffPermissionService extends BaseService {
  constructor(
    @InjectService(MerchantStaffPermEntity)
    private permEntityService: OrmService<MerchantStaffPermEntity>,
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
  }: MerchantPermListDTO) {
    return this.permEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        isCategory,
        categoryId,
        name_contains: name,
        code_contains: code,
      },
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
   * 项目启动时，自动更新数据库里的权限字段
   * @param data
   * @param merchantPermRepostory
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async initPermission(
    @TransactionRepository(MerchantStaffPermEntity)
    merchantPermRepostory?: Repository<MerchantStaffPermEntity>,
  ) {
    const codes: string[] = permissions.map(item => {
      item.systemPerm = MerchantStaffIsSystemPermEnum.TRUE;
      return item.code;
    });
    const merchantPermService = this.getService<
      MerchantStaffPermEntity,
      OrmService<MerchantStaffPermEntity>
    >(merchantPermRepostory);
    const perms = await merchantPermService.find({
      select: ['code'],
      where: {
        code_in: codes,
      },
    });
    const noRepeatCodes = permissions.filter(
      item => !perms.find(perm => perm.code === item.code),
    );
    await merchantPermService.createMany(noRepeatCodes, 0);
  }
}
