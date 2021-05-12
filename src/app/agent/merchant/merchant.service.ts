import { Injectable } from '@nestjs/common';
import {
  InjectService,
  Transaction,
  TransactionRepository,
  Repository,
} from '@jiaxinjiang/nest-orm';
import {
  MerchantEntity,
  MerchantStaffEntity,
  MerchantStaffIsNativeEnum,
  MerchantIsActiveEnum,
  AgentEntity,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  AgentModifyMerchantDTO,
  AgentMerchantDetailResp,
  AgentMerchantListDTO,
} from './merchant.dto';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  AgentMerchantCountOverLimitException,
  AgentMerchantEmailRepeatException,
  AgentMerchantPhoneRepeatException,
  AgentMerchantStaffNoExistException,
} from './merchant.exception';
import { CryptoHelperProvider } from '@shared/helper';
import { OrmService } from '@typeorm/orm.service';

@Injectable()
export class AgentMerchantService extends BaseService {
  constructor(
    @InjectService(MerchantEntity)
    private merchantEntityService: OrmService<MerchantEntity>,
    @InjectService(MerchantStaffEntity)
    private merchantStaffEntityService: OrmService<MerchantStaffEntity>,
  ) {
    super();
  }

  /**
   * 获取商户列表
   * @param param0
   */
  async list(
    { pageIndex, pageSize, name }: AgentMerchantListDTO,
    { agentId }: AgentIdentity,
  ) {
    return this.merchantEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        name_contains: name,
        agentId,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  /**
   * 获取商户详情
   * @param param0
   */
  async detail(
    id: number,
    { agentId }: AgentIdentity,
  ): Promise<AgentMerchantDetailResp> {
    const [merchant, admin] = await Promise.all([
      this.merchantEntityService.findOne({
        where: {
          id,
          agentId,
        },
      }),
      this.merchantStaffEntityService.findOne({
        where: {
          merchantId: id,
          isNative: MerchantStaffIsNativeEnum.TRUE,
        },
      }),
    ]);
    return { merchant, admin };
  }

  /**
   * 启用/禁用商户
   * @param id
   * @param isActive
   * @param param2
   */
  async active(
    id: number,
    isActive: MerchantIsActiveEnum,
    { userId, agentId }: AgentIdentity,
  ) {
    await this.merchantEntityService.update(
      { isActive },
      {
        id,
        agentId,
      },
      userId,
    );
    return true;
  }

  /**
   * 新增商户
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async create(
    data: AgentModifyMerchantDTO,
    { userId, agentId }: AgentIdentity,
    @TransactionRepository(AgentEntity)
    agentRepo?: Repository<AgentEntity>,
    @TransactionRepository(MerchantEntity)
    merchantRepo?: Repository<MerchantEntity>,
    @TransactionRepository(MerchantStaffEntity)
    merchantStaffRepo?: Repository<MerchantStaffEntity>,
  ) {
    const { phone, email } = data.adminUser;
    const agentEntityService = this.getService<
      AgentEntity,
      OrmService<AgentEntity>
    >(agentRepo);
    const merchantEntityService = this.getService<
      MerchantEntity,
      OrmService<MerchantEntity>
    >(merchantRepo);
    const merchantStaffEntityService = this.getService<
      MerchantStaffEntity,
      OrmService<MerchantStaffEntity>
    >(merchantStaffRepo);
    const phoneCount = await merchantStaffEntityService.count({ phone });
    if (phoneCount) {
      throw new AgentMerchantPhoneRepeatException();
    }
    const emailCount = await merchantStaffEntityService.count({ email });
    if (emailCount) {
      throw new AgentMerchantEmailRepeatException();
    }
    const [agent, merchantCount] = await Promise.all([
      agentEntityService.findById(agentId, { select: ['maxMerchantCount'] }),
      merchantEntityService.count({ agentId }),
    ]);
    if (agent.maxMerchantCount > 0 && merchantCount >= agent.maxMerchantCount) {
      throw new AgentMerchantCountOverLimitException();
    }
    if (!data.expireTime) {
      data.expireTime = null;
    }
    const merchant = await merchantEntityService.create(
      {
        ...data,
        agentId,
      },
      userId,
    );
    await merchantStaffEntityService.create(
      {
        ...data.adminUser,
        isNative: MerchantStaffIsNativeEnum.TRUE,
        merchant,
      },
      userId,
    );
    return true;
  }

  /**
   * 新增商户
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async update(
    merchantId: number,
    data: AgentModifyMerchantDTO,
    { user }: AgentIdentity,
    @TransactionRepository(MerchantEntity)
    merchantRepo?: Repository<MerchantEntity>,
    @TransactionRepository(MerchantStaffEntity)
    merchantStaffRepo?: Repository<MerchantStaffEntity>,
  ) {
    const merchantStaff = data.adminUser;
    delete data.adminUser;
    const { phone, email, password } = merchantStaff;
    const merchantEntityService = this.getService<
      MerchantEntity,
      OrmService<MerchantEntity>
    >(merchantRepo);
    const merchantStaffEntityService = this.getService<
      MerchantStaffEntity,
      OrmService<MerchantStaffEntity>
    >(merchantStaffRepo);
    const userinfo = await merchantStaffEntityService.findOne({
      select: ['phone', 'email', 'password'],
      where: {
        merchantId,
        isNative: MerchantStaffIsNativeEnum.TRUE,
      },
    });
    if (!userinfo) {
      throw new AgentMerchantStaffNoExistException();
    }
    if (userinfo.phone !== phone) {
      const count = await merchantStaffEntityService.count({ phone });
      if (count) {
        throw new AgentMerchantPhoneRepeatException();
      }
    }
    if (userinfo.email !== email) {
      const count = await merchantStaffEntityService.count({ email });
      if (count) {
        throw new AgentMerchantEmailRepeatException();
      }
    }
    if (password && userinfo.password !== password) {
      merchantStaff.password = CryptoHelperProvider.hash(password);
    }
    if (!data.expireTime) {
      data.expireTime = null;
    }
    await Promise.all([
      merchantEntityService.updateById(data, merchantId, user.id),
      merchantStaffEntityService.updateById(
        merchantStaff,
        userinfo.id,
        user.id,
      ),
    ]);
    return true;
  }
}
