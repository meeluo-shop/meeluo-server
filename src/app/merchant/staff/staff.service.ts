import { Injectable, Inject } from '@nestjs/common';
import {
  MerchantStaffEntity,
  MerchantStaffIsNativeEnum,
  MerchantStaffIsActiveEnum,
  MerchantStaffRoleEntity,
  MerchantUserEntity,
} from '@typeorm/meeluoShop';
import { IsDeleteEnum } from '@typeorm/base.entity';
import { BaseService } from '@app/app.service';
import {
  InjectService,
  Transaction,
  TransactionRepository,
  Repository,
  In,
} from '@jiaxinjiang/nest-orm';
import {
  MerchantModifyStaffDTO,
  MerchantStaffListDTO,
  MerchantStaffIdListDTO,
} from './staff.dto';
import {
  MEELUO_SHOP_DATABASE,
  MERCHANT_STAFF_CHANGED_PREFIX,
} from '@core/constant';
import {
  MerchantStaffNoExistentException,
  MerchantStaffPhoneRepeatException,
  MerchantStaffEmailRepeatException,
  MerchantStaffBindWechatUserException,
} from './staff.exception';
import { CryptoHelperProvider } from '@shared/helper';
import { OrmService } from '@typeorm/orm.service';
import { MerchantUserService } from '../user/user.service';
import { CacheProvider } from '@jiaxinjiang/nest-redis';

@Injectable()
export class MerchantStaffService extends BaseService {
  constructor(
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @Inject(MerchantUserService)
    private userService: MerchantUserService,
    @InjectService(MerchantUserEntity)
    private userEntityService: OrmService<MerchantUserEntity>,
    @InjectService(MerchantStaffEntity)
    private staffEntityService: OrmService<MerchantStaffEntity>,
    @InjectService(MerchantStaffRoleEntity)
    private roleEntityService: OrmService<MerchantStaffRoleEntity>,
  ) {
    super();
  }

  /**
   * 获取员工列表
   * @param param0
   */
  async list(
    { pageIndex, pageSize, nickname, phone, email }: MerchantStaffListDTO,
    { merchantId }: MerchantIdentity,
  ) {
    const orQuery = {
      merchantId,
      isDelete: IsDeleteEnum.FALSE,
    };
    const list = await this.staffEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: [
        {
          ...orQuery,
          nickname_contains: nickname,
        },
        {
          ...orQuery,
          email_contains: email,
        },
        {
          ...orQuery,
          phone_contains: phone,
        },
      ],
      order: {
        isNative: 'DESC',
        id: 'DESC',
      },
    });
    await this.userService.bindWechatUser(list.rows, 'wechatUser', 'openid');
    return this.clearExtraFields(list);
  }

  /**
   * 获取员工详情
   * @param id
   */
  async detail(id: number, { merchantId }: MerchantIdentity) {
    const result = await this.staffEntityService.findOne({
      where: { id, merchantId },
    });
    await this.userService.bindWechatUser(result, 'wechatUser', 'openid');
    result.roles = await this.staffEntityService.repository
      .createQueryBuilder()
      .relation(MerchantStaffEntity, 'roles')
      .of(id)
      .loadMany();
    return this.clearExtraFields(result);
  }

  /**
   * 启用/禁用管理员员工
   * @param id
   * @param isActive
   * @param param2
   */
  async active(
    id: number,
    isActive: MerchantStaffIsActiveEnum,
    { user, merchantId }: MerchantIdentity,
  ) {
    await this.staffEntityService.update(
      { isActive },
      {
        id,
        isNative: MerchantStaffIsNativeEnum.FALSE,
        merchantId,
      },
      user.id,
    );
    // 标记一下用户被修改的状态
    await this.setStaffChangedSign(id, ['isActive']);
    return true;
  }

  /**
   * 设置员工微信用户
   * @param id
   * @param openid
   * @param param2
   */
  async setWechatUser(
    id: number,
    openid: string,
    { userId, merchantId }: MerchantIdentity,
  ) {
    const [currentStaff, staff, user] = await Promise.all([
      this.staffEntityService.findById(id, { select: ['openid'] }),
      this.staffEntityService.findOne({
        select: ['id'],
        where: {
          merchantId,
          openid,
        },
      }),
      this.userEntityService.findOne({
        select: ['id'],
        where: {
          merchantId,
          openid,
        },
      }),
    ]);
    // 判断要设置的openid已经绑定了其他员工
    if (staff && staff.id !== id) {
      throw new MerchantStaffBindWechatUserException({
        msg: '该微信用户已绑定了其他员工',
      });
    }
    // 判断当前openid就是自己，直接返回true
    if (staff?.id === id) {
      return true;
    }
    // 判断员工已经配置了openid
    if (currentStaff?.openid) {
      // 查询这个openid客户端用户id
      const changedUser = await this.userEntityService.findOne({
        select: ['id'],
        where: {
          merchantId,
          openid: currentStaff.openid,
        },
      });
      // 标记客户端用户状态修改，让这个移动端用户重新登陆
      if (changedUser) {
        await this.userService.setUserChangedSign(changedUser.id, ['openid']);
      }
    }
    // 让新设置的openid用户重新登陆
    await this.userService.setUserChangedSign(user.id, ['openid']);
    await this.staffEntityService.update(
      { openid },
      {
        id,
        merchantId,
      },
      userId,
    );
    return true;
  }

  /**
   * 创建员工
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async create(
    data: MerchantModifyStaffDTO,
    { user, merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantStaffEntity)
    staffRepo?: Repository<MerchantStaffEntity>,
  ) {
    const merchantStaffService = this.getService<
      MerchantStaffEntity,
      OrmService<MerchantStaffEntity>
    >(staffRepo);
    const phoneRecords = await merchantStaffService.count({
      phone: data.phone,
    });
    if (phoneRecords) {
      throw new MerchantStaffPhoneRepeatException();
    }
    const emailRecords = await merchantStaffService.count({
      email: data.email,
    });
    if (emailRecords) {
      throw new MerchantStaffEmailRepeatException();
    }
    const userinfo = await merchantStaffService.create(
      {
        ...data,
        merchantId,
      },
      user.id,
    );
    if (data.roleIds && data.roleIds.length) {
      await staffRepo
        .createQueryBuilder()
        .relation(MerchantStaffEntity, 'roles')
        .of(userinfo.id)
        .add(data.roleIds);
    }
    return userinfo;
  }

  /**
   * 更改员工信息
   * @param data
   * @param param1
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async update(
    data: MerchantModifyStaffDTO,
    id: number,
    { user, merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantStaffEntity)
    staffRepo?: Repository<MerchantStaffEntity>,
  ) {
    const roleIds = data.roleIds;
    delete data.roleIds;
    const merchantStaffService = this.getService<
      MerchantStaffEntity,
      OrmService<MerchantStaffEntity>
    >(staffRepo);
    const userinfo = await merchantStaffService.findOne({
      where: { id, merchantId },
    });
    if (!userinfo) {
      throw new MerchantStaffNoExistentException();
    }
    if (userinfo.phone !== data.phone) {
      const records = await merchantStaffService.count({
        merchantId,
        phone: data.phone,
      });
      if (records) {
        throw new MerchantStaffPhoneRepeatException();
      }
    }
    if (userinfo.email !== data.email) {
      const records = await merchantStaffService.count({
        merchantId,
        email: data.email,
      });
      if (records) {
        throw new MerchantStaffEmailRepeatException();
      }
    }
    if (data.password && userinfo.password !== data.password) {
      data.password = CryptoHelperProvider.hash(data.password);
    }
    await merchantStaffService.updateById(data, id, user.id);
    // 标记一下用户被修改的状态
    await this.setStaffChangedSign(id, Object.keys(data));
    if (roleIds && roleIds.length) {
      const allRoles = await this.roleEntityService.find({
        select: ['id'],
        where: { merchantId },
      });
      await staffRepo
        .createQueryBuilder()
        .relation(MerchantStaffEntity, 'roles')
        .of(userinfo.id)
        .addAndRemove(
          roleIds,
          allRoles.map(role => role.id),
        );
    }
    return true;
  }

  /**
   * 删除员工
   * @param param0
   */
  @Transaction(MEELUO_SHOP_DATABASE)
  async delete(
    { ids }: MerchantStaffIdListDTO,
    { user, merchantId }: MerchantIdentity,
    @TransactionRepository(MerchantStaffEntity)
    merchantStaffRepostory?: Repository<MerchantStaffEntity>,
  ) {
    const staffEntityService = this.getService<
      MerchantStaffEntity,
      OrmService<MerchantStaffEntity>
    >(merchantStaffRepostory);
    await staffEntityService.delete(
      {
        id: In(ids),
        merchantId,
        isNative: MerchantStaffIsNativeEnum.FALSE,
      },
      user.id,
    );
    // 标记一下用户被修改的状态
    await Promise.all(ids.map(id => this.setStaffChangedSign(id)));
    return true;
  }

  /**
   * 从缓存中获取用户信息被修改状态
   * @param staffId
   */
  async getStaffChangedSign(
    staffId: number,
  ): Promise<Array<keyof MerchantStaffEntity>> {
    const key = MERCHANT_STAFF_CHANGED_PREFIX + staffId;
    const value = await this.cacheProvider.get<string>(key);
    // 取完删除状态
    await this.cacheProvider.del(key);
    return JSON.parse(value);
  }

  /**
   * 在缓存中标记用户信息被修改状态
   * @param staffId
   * @param fields
   */
  async setStaffChangedSign(
    staffId: number,
    fields: Array<keyof MerchantStaffEntity | string> = [],
  ) {
    const key = MERCHANT_STAFF_CHANGED_PREFIX + staffId;
    await this.cacheProvider.set(key, JSON.stringify(fields), {
      ttl: 3600 * 24 * 7,
    });
  }
}
