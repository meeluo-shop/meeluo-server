import { Injectable } from '@nestjs/common';
import {
  InjectService,
  Transaction,
  TransactionRepository,
  Repository,
  In,
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
  AdminModifyMerchantDTO,
  AdminMerchantDetailResp,
  AdminMerchantListDTO,
} from './merchant.dto';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  EmailRepeatFailedException,
  PhoneRepeatFailedException,
  MerchantStaffNoExistException,
} from './merchant.exception';
import { CryptoHelperProvider } from '@shared/helper';
import { OrmService } from '@typeorm/orm.service';

@Injectable()
export class AdminMerchantService extends BaseService {
  constructor(
    @InjectService(AgentEntity)
    private agentEntityService: OrmService<AgentEntity>,
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
  async list({ pageIndex, pageSize, name }: AdminMerchantListDTO) {
    const data = await this.merchantEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        name_contains: name,
      },
      order: {
        id: 'DESC',
      },
    });
    if (!data.rows.length) {
      return data;
    }
    const agentIds = Array.from(new Set(data.rows.map(item => item.agentId)));
    const agents = await this.agentEntityService.find({
      select: ['name'],
      where: {
        id: In(agentIds),
      },
    });
    data.rows.forEach(item => {
      const agent = agents.find(agent => agent.id === item.agentId) || null;
      item.agent = agent;
    });
    return data;
  }

  /**
   * 获取商户详情
   * @param param0
   */
  async detail(id: number): Promise<AdminMerchantDetailResp> {
    const [merchant, admin] = await Promise.all([
      this.merchantEntityService.findById(id),
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
    { user }: AdminIdentity,
  ) {
    await this.merchantEntityService.updateById({ isActive }, id, user.id);
    return true;
  }

  /**
   * 新增商户
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async create(
    data: AdminModifyMerchantDTO,
    { user }: AdminIdentity,
    @TransactionRepository(MerchantEntity)
    merchantRepo?: Repository<MerchantEntity>,
    @TransactionRepository(MerchantStaffEntity)
    merchantStaffRepo?: Repository<MerchantStaffEntity>,
  ) {
    const { phone, email } = data.adminUser;
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
      throw new PhoneRepeatFailedException();
    }
    const emailCount = await merchantStaffEntityService.count({ email });
    if (emailCount) {
      throw new EmailRepeatFailedException();
    }
    if (!data.expireTime) {
      data.expireTime = null;
    }
    const merchant = await merchantEntityService.create(
      {
        ...data,
        agentId: null,
      },
      user.id,
    );
    await merchantStaffEntityService.create(
      {
        ...data.adminUser,
        isNative: MerchantStaffIsNativeEnum.TRUE,
        merchant,
      },
      user.id,
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
    data: AdminModifyMerchantDTO,
    { user }: AdminIdentity,
    @TransactionRepository(MerchantEntity)
    merchantRepo?: Repository<MerchantEntity>,
    @TransactionRepository(MerchantStaffEntity)
    merchantUserRepo?: Repository<MerchantStaffEntity>,
  ) {
    const agentStaff = data.adminUser;
    delete data.adminUser;
    const { phone, email, password } = agentStaff;
    const merchantEntityService = this.getService<
      MerchantEntity,
      OrmService<MerchantEntity>
    >(merchantRepo);
    const merchantStaffEntityService = this.getService<
      MerchantStaffEntity,
      OrmService<MerchantStaffEntity>
    >(merchantUserRepo);
    const userinfo = await merchantStaffEntityService.findOne({
      select: ['phone', 'email', 'password'],
      where: {
        merchantId,
        isNative: MerchantStaffIsNativeEnum.TRUE,
      },
    });
    if (!userinfo) {
      throw new MerchantStaffNoExistException();
    }
    if (userinfo.phone !== phone) {
      const count = await merchantStaffEntityService.count({ phone });
      if (count) {
        throw new PhoneRepeatFailedException();
      }
    }
    if (userinfo.email !== email) {
      const count = await merchantStaffEntityService.count({ email });
      if (count) {
        throw new EmailRepeatFailedException();
      }
    }
    if (password && userinfo.password !== password) {
      agentStaff.password = CryptoHelperProvider.hash(password);
    }
    if (!data.expireTime) {
      data.expireTime = null;
    }
    await Promise.all([
      merchantEntityService.updateById(data, merchantId, user.id),
      merchantStaffEntityService.updateById(agentStaff, userinfo.id, user.id),
    ]);
    return true;
  }
}
