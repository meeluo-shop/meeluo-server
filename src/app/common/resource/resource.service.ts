import { Inject, Injectable } from '@nestjs/common';
import {
  InjectService,
  FindConditions,
  In,
  Repository,
} from '@jiaxinjiang/nest-orm';
import { MEELUO_BUCKET } from '@core/constant';
import {
  CommonResourceGroupEntity,
  CommonResourceEntity,
} from '@typeorm/meeluoShop';
import {
  ModifyResourceGroupDTO,
  ResourceGroupListDTO,
  UploadFilesDTO,
  ResourceListDTO,
} from './resource.dto';
import { QiniuService, InjectQiniuService } from '@shared/qiniu';
import { OrmService } from '@typeorm/orm.service';
import { BaseEntity } from '@typeorm/base.entity';
import { CommonService } from '../common.service';

@Injectable()
export class ResourceService {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @InjectQiniuService(MEELUO_BUCKET)
    private qiniuService: QiniuService,
    @InjectService(CommonResourceEntity)
    private resourceEntityService: OrmService<CommonResourceEntity>,
    @InjectService(CommonResourceGroupEntity)
    private groupEntityService: OrmService<CommonResourceGroupEntity>,
  ) {}

  /**
   * 获取数据对应的资源文件（一对一）
   * @param targets
   * @param property
   * @param idProperty
   */
  async bindTargetResource<T extends BaseEntity>(
    entitys: T,
    property: keyof T,
    idProperty: keyof T,
  ): Promise<T>;
  async bindTargetResource<T extends BaseEntity>(
    entitys: T[],
    property: keyof T,
    idProperty: keyof T,
  ): Promise<T[]>;
  async bindTargetResource<T extends BaseEntity>(
    entitys: T | T[],
    property: keyof T,
    idProperty: keyof T,
  ) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets: T[] = Array.isArray(entitys) ? entitys : [entitys];
    const resourceIds = Array.from(
      new Set(targets.map(item => item[idProperty])),
    );
    const resources = await this.resourceEntityService.find({
      where: { id: In(resourceIds.length ? resourceIds : [null]) },
    });
    targets.forEach((target: any) => {
      target[property] =
        resources.find((item: any) => item.id === target[idProperty]) || null;
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 获取数据对应的资源文件（一对多）
   * @param targets
   * @param property
   * @param idProperty
   */
  async bindTargetResourceList<T extends BaseEntity>(
    entitys: T,
    repository: Repository<T>,
    propertyName: keyof T,
  ): Promise<T>;
  async bindTargetResourceList<T extends BaseEntity>(
    entitys: T[],
    repository: Repository<T>,
    propertyName: keyof T,
  ): Promise<T[]>;
  async bindTargetResourceList<T extends BaseEntity>(
    entitys: T | T[],
    repository: Repository<T>,
    propertyName: keyof T,
  ) {
    if (!entitys || (Array.isArray(entitys) && !entitys.length)) {
      return entitys;
    }
    const targets: T[] = Array.isArray(entitys) ? entitys : [entitys];
    const entityClass = repository.metadata.target;
    const resultList = await Promise.all(
      targets.map(target =>
        repository
          .createQueryBuilder()
          .relation(entityClass, String(propertyName))
          .of(target.id)
          .loadMany<CommonResourceEntity>(),
      ),
    );
    targets.forEach((target: any, index) => {
      target[propertyName] = resultList[index];
    });
    return Array.isArray(entitys) ? targets : targets[0];
  }

  /**
   * 获取文件列表
   * @param params
   * @param identity
   */
  async getFiles(
    { pageIndex, pageSize, groupId }: ResourceListDTO,
    identity: CommonIdentity,
  ) {
    const where: FindConditions<CommonResourceEntity> = {
      groupId,
    };
    if (identity['merchantId']) {
      // 如果是商户使用，则获取商户下所有的文件
      where.merchantId = identity['merchantId'];
    } else if (identity['agentId']) {
      // 如果是代理商使用，则获取代理商下所有的文件
      where.agentId = identity['agentId'];
    } else {
      // 都不是，则获取当前用户下的所有文件
      where.createdById = identity.userId;
    }
    return this.resourceEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where,
      order: {
        id: 'DESC',
      },
    });
  }

  /**
   * 批量上传文件
   * @param files
   * @param identity
   */
  async uploadFiles({ files }: UploadFilesDTO, identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    const condition = this.commonService.getTerminalCondition(
      terminal.target,
      terminal.id,
    );
    return this.resourceEntityService.createMany(
      files.map(file => ({
        ...file,
        name: file.name,
        ...condition,
      })),
      identity.userId,
    );
  }

  /**
   * 批量删除文件
   * @param ids
   * @param identity
   */
  async deleteFiles(ids: number[], identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    const condition = this.commonService.getTerminalCondition(
      terminal.target,
      terminal.id,
    );
    const where = {
      ...condition,
      id: In(ids),
    };
    // 这里忽略删除七牛云中的服务器资源
    // const files = await this.resourceEntityService.find({
    //   select: ['name'],
    //   where,
    // });
    // const keys = files.map(file => file.name);
    // await this.qiniuService.delete(keys);
    await this.resourceEntityService.delete(where, identity.userId);
    return true;
  }

  /**
   * 移动文件
   * @param resourceId
   * @param groupIds
   */
  async moveFiles(
    resourceIds: number[],
    groupId: number,
    identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    const condition = this.commonService.getTerminalCondition(
      terminal.target,
      terminal.id,
    );
    return this.resourceEntityService.update(
      {
        groupId,
      },
      {
        id: In(resourceIds),
        ...condition,
      },
      identity.userId,
    );
  }

  /**
   * 新增资源分组
   * @param data
   */
  async addGroup(data: ModifyResourceGroupDTO, identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    const condition = this.commonService.getTerminalCondition(
      terminal.target,
      terminal.id,
    );
    return this.groupEntityService.create(
      {
        ...data,
        ...condition,
      },
      identity.userId,
    );
  }

  /**
   * 修改资源分组
   * @param data
   */
  async updateGroup(
    id: number,
    data: ModifyResourceGroupDTO,
    identity: CommonIdentity,
  ) {
    await this.groupEntityService.updateById(data, id, identity.userId);
    return true;
  }

  /**
   * 删除资源分组
   * @param id
   */
  async deleteGroup(id: number, identity: CommonIdentity) {
    const where: FindConditions<CommonResourceGroupEntity> = { id };
    if (identity['merchantId']) {
      // 如果是商户使用，则获取商户下所有的文件
      where.merchantId = identity['merchantId'];
    } else if (identity['agentId']) {
      // 如果是代理商使用，则获取代理商下所有的文件
      where.agentId = identity['agentId'];
    } else {
      // 都不是，则获取当前用户下的所有文件
      where.createdById = identity.userId;
    }
    await this.groupEntityService.delete(where, identity.userId);
    return true;
  }

  /**
   * 获取资源分组列表
   * @param param0
   * @param param1
   */
  async getGroupList(
    { pageIndex, pageSize }: ResourceGroupListDTO,
    identity: CommonIdentity,
  ) {
    const where: FindConditions<CommonResourceGroupEntity> = {};
    if (identity['merchantId']) {
      // 如果是商户使用，则获取商户下所有的文件
      where.merchantId = identity['merchantId'];
    } else if (identity['agentId']) {
      // 如果是代理商使用，则获取代理商下所有的文件
      where.agentId = identity['agentId'];
    } else {
      // 都不是，则获取当前用户下的所有文件
      where.createdById = identity.userId;
    }
    return this.groupEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where,
      order: {
        order: 'ASC',
      },
    });
  }
}
