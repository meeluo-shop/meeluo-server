import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import {
  Controller,
  Inject,
  Post,
  Body,
  Put,
  Param,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantTableEntity } from '@typeorm/meeluoShop';
import { MerchantTableService } from './table.service';
import {
  MerchantTableCreateException,
  MerchantTableDeleteException,
  MerchantTableDetailException,
  MerchantTableListException,
  MerchantTableUpdateException,
} from './table.exception';
import {
  MerchantTableIdDTO,
  MerchantTableListDTO,
  MerchantTableModifyDTO,
} from './table.dto';

@ApiTags('商户后台餐桌相关接口')
@Controller('merchant/table')
export class MerchantTableController {
  constructor(
    @Inject(MerchantTableService)
    private tableService: MerchantTableService,
  ) {}

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增餐桌' })
  @ApiErrorResponse(MerchantTableCreateException)
  async create(
    @Body() body: MerchantTableModifyDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.tableService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改餐桌' })
  @ApiErrorResponse(MerchantTableUpdateException)
  async update(
    @Param() { id }: MerchantTableIdDTO,
    @Body() body: MerchantTableModifyDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.tableService.update(id, body, identity);
  }

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取餐桌列表' })
  @ApiOkResponse({ type: [MerchantTableEntity] })
  @ApiErrorResponse(MerchantTableListException)
  async list(
    @Query() query: MerchantTableListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.tableService.list(query, identity.merchantId);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取餐桌详情' })
  @ApiErrorResponse(MerchantTableDetailException)
  async detail(
    @Param() { id }: MerchantTableIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.tableService.detail(id, identity.merchantId);
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除餐桌' })
  @ApiErrorResponse(MerchantTableDeleteException)
  async delete(
    @Param() { id }: MerchantTableIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.tableService.delete(id, identity);
  }

  @Authorize()
  @Post('print/qrcode/:id')
  @ApiOperation({ summary: '打印餐桌二维码' })
  @ApiErrorResponse(MerchantTableDeleteException)
  async printQRCode(
    @Param() { id }: MerchantTableIdDTO,
    @Identity() { merchantId, userId }: MerchantIdentity,
  ) {
    return this.tableService.printQRCode(id, userId, merchantId);
  }
}
