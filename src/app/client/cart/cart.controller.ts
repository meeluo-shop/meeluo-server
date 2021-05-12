import { Authorize, Identity } from '@core/decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Put,
} from '@nestjs/common';
import { ApiErrorResponse, ApiOperation, ApiTags } from '@shared/swagger';
import { ClientCartAddDTO, ClientCartDeleteDTO } from './cart.dto';
import {
  ClientCartAddFailedException,
  ClientCartListFailedException,
  ClientCartDeleteFailedException,
  ClientCartDecrFailedException,
  ClientCartCountFailedException,
} from './cart.exception';
import { ClientCartService } from './cart.service';

@ApiTags('客户端购物车相关接口')
@Controller('client/cart')
export class ClientCartController {
  constructor(
    @Inject(ClientCartService)
    private cartService: ClientCartService,
  ) {}

  @Authorize()
  @Post('add')
  @ApiOperation({ summary: '购物车添加商品' })
  @ApiErrorResponse(ClientCartAddFailedException)
  async add(
    @Body() body: ClientCartAddDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.cartService.add(body, identity);
  }

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取购物车商品列表' })
  @ApiErrorResponse(ClientCartListFailedException)
  async list(@Identity() identity: ClientIdentity) {
    return this.cartService.list(identity);
  }

  @Authorize()
  @Get('count')
  @ApiOperation({ summary: '获取购物车商品数量' })
  @ApiErrorResponse(ClientCartCountFailedException)
  async count(@Identity() identity: ClientIdentity) {
    return this.cartService.count(identity);
  }

  @Authorize()
  @Delete('delete')
  @ApiOperation({ summary: '购物车删除商品' })
  @ApiErrorResponse(ClientCartDeleteFailedException)
  async delete(
    @Body() body: ClientCartDeleteDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.cartService.delete(body, identity);
  }

  @Authorize()
  @Put('decr')
  @ApiOperation({ summary: '减少购物车商品数量' })
  @ApiErrorResponse(ClientCartDecrFailedException)
  async desc(
    @Body() body: ClientCartDeleteDTO,
    @Identity() identity: ClientIdentity,
  ) {
    return this.cartService.decr(body, identity);
  }
}
