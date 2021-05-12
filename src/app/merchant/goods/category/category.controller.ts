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
import { MerchantGoodsCategoryEntity } from '@typeorm/meeluoShop';
import {
  ModifyMerchantGoodsCategoryDTO,
  MerchantGoodsCategoryIdDTO,
  MerchantGoodsCategoryListDTO,
} from './category.dto';
import { MerchantGoodsCategoryService } from './category.service';
import {
  DeleteMerchantGoodsCategoryFailedException,
  GetMerchantGoodsCategoryDetailFailedException,
  GetMerchantGoodsCategorysFailedException,
  CreateMerchantGoodsCategoryFailedException,
  UpdateMerchantGoodsCategoryFailedException,
} from './category.exception';

@ApiTags('商户后台商品分类相关接口')
@Controller('merchant/goods/category')
export class MerchantGoodsCategoryController {
  constructor(
    @Inject(MerchantGoodsCategoryService)
    private categoryService: MerchantGoodsCategoryService,
  ) {}

  @Authorize()
  @Post('create')
  @ApiOperation({ summary: '新增商品分类' })
  @ApiErrorResponse(CreateMerchantGoodsCategoryFailedException)
  async create(
    @Body() body: ModifyMerchantGoodsCategoryDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.categoryService.create(body, identity);
  }

  @Authorize()
  @Put('update/:id')
  @ApiOperation({ summary: '修改商品分类' })
  @ApiErrorResponse(UpdateMerchantGoodsCategoryFailedException)
  async update(
    @Param() { id }: MerchantGoodsCategoryIdDTO,
    @Body() body: ModifyMerchantGoodsCategoryDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.categoryService.update(id, body, identity);
  }

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取商品分类列表' })
  @ApiOkResponse({ type: [MerchantGoodsCategoryEntity] })
  @ApiErrorResponse(GetMerchantGoodsCategorysFailedException)
  async list(
    @Query() query: MerchantGoodsCategoryListDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.categoryService.list(query, identity.merchantId);
  }

  @Authorize()
  @Get('detail/:id')
  @ApiOperation({ summary: '获取商品分类详情' })
  @ApiErrorResponse(GetMerchantGoodsCategoryDetailFailedException)
  async detail(
    @Param() { id }: MerchantGoodsCategoryIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.categoryService.detail(id, identity);
  }

  @Authorize()
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除商品分类' })
  @ApiErrorResponse(DeleteMerchantGoodsCategoryFailedException)
  async delete(
    @Param() { id }: MerchantGoodsCategoryIdDTO,
    @Identity() identity: MerchantIdentity,
  ) {
    return this.categoryService.delete(id, identity);
  }
}
