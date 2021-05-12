import { Injectable } from '@nestjs/common';
import {
  InjectService,
  Transaction,
  TransactionRepository,
  Repository,
} from '@jiaxinjiang/nest-orm';
import {
  AgentEntity,
  AgentUserEntity,
  AgentUserIsNativeEnum,
  AgentIsActiveEnum,
} from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import {
  AdminModifyAgentDTO,
  AdminAgentDetailResp,
  AdminAgentListDTO,
} from './agent.dto';
import { MEELUO_SHOP_DATABASE } from '@core/constant';
import {
  EmailRepeatFailedException,
  PhoneRepeatFailedException,
  AgentAdminNoExistException,
} from './agent.exception';
import { CryptoHelperProvider } from '@shared/helper';
import { OrmService } from '@typeorm/orm.service';

@Injectable()
export class AdminAgentService extends BaseService {
  constructor(
    @InjectService(AgentEntity)
    private agentEntityService: OrmService<AgentEntity>,
    @InjectService(AgentUserEntity)
    private agentUserEntityService: OrmService<AgentUserEntity>,
  ) {
    super();
  }

  /**
   * 获取代理商列表
   * @param param0
   */
  async list({ pageIndex, pageSize, name }: AdminAgentListDTO) {
    return this.agentEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        name_contains: name,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  /**
   * 获取代理商详情
   * @param param0
   */
  async detail(id: number): Promise<AdminAgentDetailResp> {
    const [agent, admin] = await Promise.all([
      this.agentEntityService.findById(id),
      this.agentUserEntityService.findOne({
        where: {
          agentId: id,
          isNative: AgentUserIsNativeEnum.TRUE,
        },
      }),
    ]);
    return { agent, admin };
  }

  /**
   * 启用/禁用代理商
   * @param id
   * @param isActive
   * @param param2
   */
  async active(
    id: number,
    isActive: AgentIsActiveEnum,
    { user }: AdminIdentity,
  ) {
    await this.agentEntityService.updateById({ isActive }, id, user.id);
    return true;
  }

  /**
   * 新增代理商
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async create(
    data: AdminModifyAgentDTO,
    { user }: AdminIdentity,
    @TransactionRepository(AgentEntity)
    agentRepo?: Repository<AgentEntity>,
    @TransactionRepository(AgentUserEntity)
    agentUserRepo?: Repository<AgentUserEntity>,
  ) {
    const { phone, email } = data.adminUser;
    const agentEntityService = this.getService<
      AgentEntity,
      OrmService<AgentEntity>
    >(agentRepo);
    const agentUserEntityService = this.getService<
      AgentUserEntity,
      OrmService<AgentUserEntity>
    >(agentUserRepo);
    const phoneCount = await agentUserEntityService.count({ phone });
    if (phoneCount) {
      throw new PhoneRepeatFailedException();
    }
    const emailCount = await agentUserEntityService.count({ email });
    if (emailCount) {
      throw new EmailRepeatFailedException();
    }
    if (!data.expireTime) {
      data.expireTime = null;
    }
    const agent = await agentEntityService.create(
      {
        ...data,
      },
      user.id,
    );
    await agentUserEntityService.create(
      {
        ...data.adminUser,
        isNative: AgentUserIsNativeEnum.TRUE,
        agent,
      },
      user.id,
    );
    return true;
  }

  /**
   * 修改代理商
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async update(
    agentId: number,
    data: AdminModifyAgentDTO,
    { user }: AdminIdentity,
    @TransactionRepository(AgentEntity)
    agentRepo?: Repository<AgentEntity>,
    @TransactionRepository(AgentUserEntity)
    agentUserRepo?: Repository<AgentUserEntity>,
  ) {
    const agentAdminUser = data.adminUser;
    delete data.adminUser;
    const { phone, email, password } = agentAdminUser;
    const agentEntityService = this.getService(agentRepo);
    const agentUserEntityService = this.getService(agentUserRepo);
    const userinfo = await agentUserEntityService.findOne({
      select: ['phone', 'email', 'password'],
      where: {
        agentId,
        isNative: AgentUserIsNativeEnum.TRUE,
      },
    });
    if (!userinfo) {
      throw new AgentAdminNoExistException();
    }
    if (userinfo.phone !== phone) {
      const count = await agentUserEntityService.count({ phone });
      if (count) {
        throw new PhoneRepeatFailedException();
      }
    }
    if (userinfo.email !== email) {
      const count = await agentUserEntityService.count({ email });
      if (count) {
        throw new EmailRepeatFailedException();
      }
    }
    if (password && userinfo.password !== password) {
      agentAdminUser.password = CryptoHelperProvider.hash(password);
    }
    if (!data.expireTime) {
      data.expireTime = null;
    }
    await Promise.all([
      agentEntityService.updateById(data, agentId, user.id),
      agentUserEntityService.updateById(agentAdminUser, userinfo.id, user.id),
    ]);
    return true;
  }
}
