import { Inject, Injectable } from '@nestjs/common';
import { InjectService } from '@jiaxinjiang/nest-orm';
import { MerchantTableEntity } from '@typeorm/meeluoShop';
import { BaseService } from '@app/app.service';
import { OrmService } from '@typeorm/orm.service';
import { MerchantTableListDTO, MerchantTableModifyDTO } from './table.dto';
import { CLIENT_USER_TABLE_ID } from '@core/constant';
import { CacheProvider } from '@jiaxinjiang/nest-redis';
import { MerchantDevicePrinterService, PrintTypeEnum } from '../device/printer';
import { UtilHelperProvider } from '@shared/helper';
import { MerchantWechatQRCodeService } from '@app/merchant/wechat/qrcode';

@Injectable()
export class MerchantTableService extends BaseService {
  constructor(
    @Inject(CacheProvider)
    private cacheProvider: CacheProvider,
    @Inject(MerchantDevicePrinterService)
    private devicePrinterService: MerchantDevicePrinterService,
    @Inject(MerchantWechatQRCodeService)
    private wechatQRCodeService: MerchantWechatQRCodeService,
    @InjectService(MerchantTableEntity)
    private tableEntityService: OrmService<MerchantTableEntity>,
  ) {
    super();
  }

  /**
   * 获取餐桌列表
   * @param param0
   * @param param1
   */
  async list(
    { pageIndex, pageSize, status }: MerchantTableListDTO,
    merchantId: number,
  ) {
    return this.tableEntityService.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        merchantId,
        status,
      },
      order: {
        order: 'ASC',
      },
    });
  }

  /**
   * 创建餐桌
   * @param data
   * @param param1
   */
  async create(
    data: MerchantTableModifyDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    return this.tableEntityService.create(
      {
        ...data,
        merchantId,
      },
      user.id,
    );
  }

  /**
   * 修改餐桌
   * @param id
   * @param data
   * @param param2
   */
  async update(
    id: number,
    data: MerchantTableModifyDTO,
    { user, merchantId }: MerchantIdentity,
  ) {
    await this.tableEntityService.update(
      data,
      {
        id,
        merchantId,
      },
      user.id,
    );
    return true;
  }

  /**
   * 获取餐桌详情
   * @param id
   * @param param1
   */
  async detail(id: number, merchantId: number) {
    return this.tableEntityService.findOne({
      where: {
        id,
        merchantId,
      },
    });
  }

  /**
   * 删除餐桌
   * @param id
   * @param param1
   */
  async delete(id: number, { user, merchantId }: MerchantIdentity) {
    await this.tableEntityService.delete(
      {
        id,
        merchantId,
      },
      user.id,
    );
    return true;
  }

  /**
   * 设置用户扫码后的餐桌id
   */
  async setScanTableId({
    openid,
    merchantId,
    tableId,
  }: {
    openid: string;
    merchantId: number;
    tableId: number;
  }) {
    const key = `${CLIENT_USER_TABLE_ID}:${merchantId}:${openid}`;
    // 餐桌缓存2小时
    await this.cacheProvider.set<number>(key, tableId, {
      ttl: 3600 * 2,
    });
  }

  /**
   * 获取用户扫码后的餐桌id
   */
  async getScanTableId({
    openid,
    merchantId,
  }: {
    openid: string;
    merchantId: number;
  }) {
    const key = `${CLIENT_USER_TABLE_ID}:${merchantId}:${openid}`;
    return this.cacheProvider.get<number>(key);
  }

  /**
   * 打印餐桌二维码
   * @param imgUrl
   */
  async printQRCode(id: number, userId: number, merchantId: number) {
    const qrcode = await this.wechatQRCodeService.getTableQRCode(
      id,
      merchantId,
      userId,
    );
    await this.devicePrinterService.print({
      printType: PrintTypeEnum.QRCODE,
      content: qrcode.url,
      originId: UtilHelperProvider.generateOrderNo(),
      merchantId,
    });
    return true;
  }
}
