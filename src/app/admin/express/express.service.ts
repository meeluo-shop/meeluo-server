import { Injectable } from '@nestjs/common';
import { BaseService } from '@app/app.service';
import { AdminExpressModifyDTO, AdminExpressListDTO } from './express.dto';
import { InjectService } from '@jiaxinjiang/nest-orm';
import { OrmService } from '@typeorm/orm.service';
import { AdminExpressEntity } from '@typeorm/meeluoShop';

@Injectable()
export class AdminExpressService extends BaseService {
  constructor(
    @InjectService(AdminExpressEntity)
    private expressEntityService: OrmService<AdminExpressEntity>,
  ) {
    super();
  }
  /**
   * 获取物流公司列表
   * @param param0
   */
  async list({ pageIndex, pageSize }: AdminExpressListDTO) {
    return this.expressEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      order: {
        order: 'ASC',
        id: 'DESC',
      },
    });
  }

  /**
   * 获取物流公司详情
   * @param id
   */
  async detail(id: number) {
    return this.expressEntityService.findById(id);
  }

  /**
   * 新增物流公司
   * @param data
   * @param param1
   */
  async create(data: AdminExpressModifyDTO, { userId }: AdminIdentity) {
    return this.expressEntityService.create(data, userId);
  }

  /**
   * 修改物流公司
   * @param data
   * @param param1
   */
  async update(
    id: number,
    data: AdminExpressModifyDTO,
    { userId }: AdminIdentity,
  ) {
    await this.expressEntityService.updateById(data, id, userId);
    return true;
  }

  /**
   * 删除物流公司
   * @param id
   * @param param1
   */
  async delete(id: number, { userId }: AdminIdentity) {
    await this.expressEntityService.deleteById(id, userId);
    return true;
  }
}
