import { BaseService } from '@app/app.service';
import { In, InjectService } from '@jiaxinjiang/nest-orm';
import { Inject, Injectable } from '@nestjs/common';
import { Case, switchHandler } from '@shared/helper';
import { YiLianService } from '@shared/yilian';
import {
  MerchantDevicePrinterBrandEnum,
  MerchantDevicePrinterEntity,
  MerchantDevicePrinterIsActiveEnum,
} from '@typeorm/meeluoShop';
import { OrmService } from '@typeorm/orm.service';
import {
  MerchantDevicePrinterCreateDTO,
  MerchantDevicePrinterListDTO,
} from './printer.dto';
import { MerchantDevicePrinterKeyExistsException } from './printer.exception';
import { PrintTypeEnum, PrinterActionEnum } from './printer.enum';
import { PrintParams } from './printer.interface';

@Injectable()
export class MerchantDevicePrinterService extends BaseService {
  constructor(
    @Inject(YiLianService)
    private yiLianService: YiLianService,
    @InjectService(MerchantDevicePrinterEntity)
    private printerEntitySerivce: OrmService<MerchantDevicePrinterEntity>,
  ) {
    super();
  }

  /**
   * 获取打印机列表
   * @param param0
   * @param merchantId
   */
  async list(
    { pageIndex, pageSize, isActive, brand }: MerchantDevicePrinterListDTO,
    merchantId: number,
  ) {
    return this.printerEntitySerivce.findAndCount({
      take: pageSize,
      skip: (pageIndex - 1) * pageSize,
      where: {
        merchantId,
        brand,
        isActive,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  /**
   * 获取打印机详情
   * @param id
   * @param merchantId
   */
  async detail(id: number, merchantId: number) {
    return this.printerEntitySerivce.findOne({
      where: {
        id,
        merchantId,
      },
    });
  }

  /**
   * 判断设备编号是否存在
   */
  async checkDeviceKey(key: string, merchantId: number) {
    const count = await this.printerEntitySerivce.count({
      merchantId,
      key,
    });
    if (count) {
      throw new MerchantDevicePrinterKeyExistsException();
    }
  }

  /**
   * 获取打印机云端状态
   * @param id
   * @param merchantId
   */
  async cloudStatus(id: number, merchantId: number) {
    const printer = await this.detail(id, merchantId);
    return switchHandler<(param: MerchantDevicePrinterEntity) => void>(
      this,
      PrinterActionEnum.DETAIL_ACTION + printer.brand,
    )(printer);
  }

  /**
   * 添加打印机设备
   * @param data
   * @param param1
   */
  async addPrinter(
    data: MerchantDevicePrinterCreateDTO,
    { merchantId, userId }: MerchantIdentity,
  ) {
    await this.checkDeviceKey(data.key, merchantId);
    await switchHandler<(param: MerchantDevicePrinterCreateDTO) => void>(
      this,
      PrinterActionEnum.CREATE_ACTION + data.brand,
    )(data);
    return this.printerEntitySerivce.create(
      {
        ...data,
        merchantId,
      },
      userId,
    );
  }

  /**
   * 更新打印机
   * @param id
   * @param data
   * @param param2
   * @returns
   */
  async updatePrinter(
    id: number,
    data: MerchantDevicePrinterCreateDTO,
    { merchantId, userId }: MerchantIdentity,
  ) {
    const printer = await this.printerEntitySerivce.findOne({
      where: {
        id,
        merchantId,
      },
    });
    await switchHandler<(param: MerchantDevicePrinterCreateDTO) => void>(
      this,
      PrinterActionEnum.CREATE_ACTION + data.brand,
    )(data);
    if (printer.key !== data.key) {
      await this.checkDeviceKey(data.key, merchantId);
      await switchHandler<(param: MerchantDevicePrinterCreateDTO) => void>(
        this,
        PrinterActionEnum.DELETE_ACTION + printer.brand,
      )(printer);
    }
    await this.printerEntitySerivce.update(
      data,
      {
        id,
        merchantId,
      },
      userId,
    );
    return true;
  }

  /**
   * 删除打印机设备
   * @param data
   * @param param1
   */
  async deletePrinter(id: number, { merchantId, userId }: MerchantIdentity) {
    const printer = await this.printerEntitySerivce.findOne({
      where: {
        id,
        merchantId,
      },
    });
    await switchHandler<(param: MerchantDevicePrinterEntity) => void>(
      this,
      PrinterActionEnum.DELETE_ACTION + printer.brand,
    )(printer);
    await this.printerEntitySerivce.delete(
      {
        id,
        merchantId,
      },
      userId,
    );
    return true;
  }

  /**
   * 往易联云平台上添加设备
   * @param param0
   */
  @Case(
    PrinterActionEnum.CREATE_ACTION + MerchantDevicePrinterBrandEnum.YILIANYUN,
  )
  async yiLianAddPrinter({
    key,
    secret,
    name,
    phone,
  }: MerchantDevicePrinterCreateDTO) {
    await this.yiLianService.addPrinter({
      machineCode: key,
      msign: secret,
      nickName: name,
      phone,
    });
  }

  /**
   * 往易联云平台上删除设备
   * @param param0
   */
  @Case(
    PrinterActionEnum.DELETE_ACTION + MerchantDevicePrinterBrandEnum.YILIANYUN,
  )
  async yiLianDeletePrinter(printer: MerchantDevicePrinterEntity) {
    await this.yiLianService.deletePrinter(printer.key);
  }

  /**
   * 获取易联云云端设备状态
   * @param printer
   * @returns
   */
  @Case(
    PrinterActionEnum.DETAIL_ACTION + MerchantDevicePrinterBrandEnum.YILIANYUN,
  )
  async yiLianDetailPrinter(printer: MerchantDevicePrinterEntity) {
    return this.yiLianService.getPrintStatus(printer.key);
  }

  /**
   * 打印内容
   * @param param0
   * @returns
   */
  async print({
    printType,
    printerIds,
    content,
    originId,
    merchantId,
  }: {
    printerIds?: number[];
    originId: string | number;
    content: string;
    printType: PrintTypeEnum;
    merchantId: number;
  }) {
    const printerList = await this.printerEntitySerivce.find({
      where: {
        printerIds: printerIds
          ? printerIds.length
            ? In(printerIds)
            : [null]
          : undefined,
        merchantId,
        isActive: MerchantDevicePrinterIsActiveEnum.TRUE,
      },
    });

    return Promise.all(
      printerList.map(printer =>
        switchHandler(
          this,
          printType + printer.brand,
        )({
          machineCode: printer.key,
          originId,
          content,
          printCount: printer.printCount,
        }),
      ),
    );
  }

  /**
   * 易联云打印二维码小票
   * @param param0
   * @returns
   */
  @Case(PrintTypeEnum.QRCODE + MerchantDevicePrinterBrandEnum.YILIANYUN)
  async yiLianPrintQRCode({ machineCode, originId, content }: PrintParams) {
    return this.yiLianService.printText({
      machineCode,
      originId,
      content: `<QR>${content}</QR>`,
    });
  }

  /**
   * 易联云打印文本小票
   * @param param0
   * @returns
   */
  @Case(PrintTypeEnum.TEXT + MerchantDevicePrinterBrandEnum.YILIANYUN)
  async yiLianPrintText({
    machineCode,
    originId,
    content,
    printCount,
  }: PrintParams) {
    if (content.indexOf('<MN>') < 0) {
      content = `<MN>${printCount}</MN>` + content;
    }
    return this.yiLianService.printText({
      machineCode,
      originId,
      content,
    });
  }

  /**
   * 易联云打印图片小票
   * @param param0
   * @returns
   */
  @Case(PrintTypeEnum.IMAGE + MerchantDevicePrinterBrandEnum.YILIANYUN)
  async yiLianPrintImage({ machineCode, originId, content }: PrintParams) {
    return this.yiLianService.printImage({
      machineCode,
      originId,
      pictureUrl: content,
    });
  }
}
