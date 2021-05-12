import { Authorize, Identity } from '@core/decorator';
import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  Put,
  Delete,
  Get,
} from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@shared/swagger';
import {
  ClientAddressCreateException,
  ClientAddressUpdateException,
  ClientAddressDeleteException,
} from './address.exception';
import {
  ClientAddressModifyParamDTO,
  ClientAddressIdDTO,
  ClientAddressInfoDTO,
} from './address.dto';
import { ClientAddressService } from './address.service';

@ApiTags('客户端用户收货地址相关接口')
@Controller('client/address')
export class ClientAddressController {
  constructor(
    @Inject(ClientAddressService)
    private addressService: ClientAddressService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOkResponse({ type: [ClientAddressInfoDTO] })
  @ApiOperation({ summary: '获取收货地址列表' })
  @ApiErrorResponse(ClientAddressCreateException)
  async list(@Identity() identity: ClientIdentity) {
    return this.addressService.list(identity);
  }

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增收货地址' })
  @ApiErrorResponse(ClientAddressCreateException)
  async create(
    @Body() body: ClientAddressModifyParamDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.addressService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改收货地址' })
  @ApiErrorResponse(ClientAddressUpdateException)
  async update(
    @Param() { id }: ClientAddressIdDTO,
    @Body() body: ClientAddressModifyParamDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.addressService.update(id, body, identity);
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除收货地址' })
  @ApiErrorResponse(ClientAddressDeleteException)
  async delete(
    @Param() { id }: ClientAddressIdDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.addressService.delete(id, identity);
  }
}
