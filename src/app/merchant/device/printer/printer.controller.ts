import { Authorize, Identity } from '@core/decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import { MerchantDevicePrinterEntity } from '@typeorm/meeluoShop';
import {
  MerchantDevicePrinterListDTO,
  MerchantDevicePrinterIdDTO,
  MerchantDevicePrinterCreateDTO,
} from './printer.dto';
import {
  MerchantDevicePrinterDeleteException,
  MerchantDevicePrinterCreateException,
  MerchantDevicePrinterListException,
  MerchantDevicePrinterDetailException,
  MerchantDevicePrinterUpdateException,
  MerchantDevicePrinterStatusException,
} from './printer.exception';
import { MerchantDevicePrinterService } from './printer.service';

@ApiTags('商户后台打印机设备相关接口')
@Controller('merchant/device/printer')
export class MerchantDevicePrinterController {
  constructor(
    @Inject(MerchantDevicePrinterService)
    private printerService: MerchantDevicePrinterService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取打印机列表' })
  @ApiOkResponse({ type: [MerchantDevicePrinterEntity] })
  @ApiErrorResponse(MerchantDevicePrinterListException)
  async list(
    @Query() query: MerchantDevicePrinterListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.printerService.list(query, identity.merchantId);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取打印机详情' })
  @ApiErrorResponse(MerchantDevicePrinterDetailException)
  async detail(
    @Param() { id }: MerchantDevicePrinterIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.printerService.detail(id, identity.merchantId);
  }

  @Authorize()
  @Get('status/:id')
  @ApiOperation({ summary: '获取打印机状态' })
  @ApiErrorResponse(MerchantDevicePrinterStatusException)
  async status(
    @Param() { id }: MerchantDevicePrinterIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.printerService.cloudStatus(id, identity.merchantId);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增打印机' })
  @ApiErrorResponse(MerchantDevicePrinterCreateException)
  async create(
    @Body() body: MerchantDevicePrinterCreateDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.printerService.addPrinter(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改打印机' })
  @ApiErrorResponse(MerchantDevicePrinterUpdateException)
  async update(
    @Param() { id }: MerchantDevicePrinterIdDTO,
    @Body() body: MerchantDevicePrinterCreateDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.printerService.updatePrinter(id, body, identity);
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除打印机' })
  @ApiErrorResponse(MerchantDevicePrinterDeleteException)
  async delete(
    @Param() { id }: MerchantDevicePrinterIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.printerService.deletePrinter(id, identity);
  }
}
