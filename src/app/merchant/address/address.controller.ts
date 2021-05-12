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
import { MerchantAddressService } from './address.service';
import {
  ModifyMerchantAddressDTO,
  MerchantAddressIdDTO,
  MerchantAddressListDTO,
} from './address.dto';
import {
  GetMerchantAddressesFailedException,
  CreateMerchantAddressFailedException,
  UpdateMerchantAddressFailedException,
  DeleteMerchantAddressFailedException,
  GetMerchantAddressDetailFailedException,
} from './address.exception';
import { MerchantAddressEntity } from '@typeorm/meeluoShop';

@ApiTags('商户后台退货地址相关接口')
@Controller('merchant/address')
export class MerchantAddressController {
  constructor(
    @Inject(MerchantAddressService)
    private addressService: MerchantAddressService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取退货地址列表' })
  @ApiOkResponse({ type: [MerchantAddressEntity] })
  @ApiErrorResponse(GetMerchantAddressesFailedException)
  async list(
    @Query() query: MerchantAddressListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.addressService.list(query, identity);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '查看退货地址详情' })
  @ApiErrorResponse(GetMerchantAddressDetailFailedException)
  async detail(
    @Param() { id }: MerchantAddressIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.addressService.detail(id, identity);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增退货地址' })
  @ApiErrorResponse(CreateMerchantAddressFailedException)
  async create(
    @Body() body: ModifyMerchantAddressDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.addressService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改退货地址' })
  @ApiErrorResponse(UpdateMerchantAddressFailedException)
  async update(
    @Param() { id }: MerchantAddressIdDTO,
    @Body() body: ModifyMerchantAddressDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.addressService.update(id, body, identity);
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除退货地址' })
  @ApiErrorResponse(DeleteMerchantAddressFailedException)
  async delete(
    @Param() { id }: MerchantAddressIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.addressService.delete(id, identity);
  }
}
