import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Controller, Post, Body, Inject } from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { MerchantGoodsSpecService } from './spec.service';
import { AddMerchantGoodsSpecDTO } from './spec.dto';
import { CreateMerchantGoodsSpecFailedException } from './spec.exception';

@ApiTags('商户后台商品规格相关接口')
@Controller('merchant/goods/spec')
export class MerchantGoodsSpecController {
  constructor(
    @Inject(MerchantGoodsSpecService)
    private specService: MerchantGoodsSpecService,
  ) {}

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增商品规格' })
  @ApiErrorResponse(CreateMerchantGoodsSpecFailedException)
  async create(
    @Body() body: AddMerchantGoodsSpecDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.specService.create(body, identity);
  }
}
