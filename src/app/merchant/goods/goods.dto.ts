import { ApiProperty } from '@shared/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsNumber,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  MerchantGoodsIsActiveEnum,
  MerchantGoodsSpecTypeEnum,
  MerchantGoodsIsEnableGradeEnum,
  MerchantGoodsIsPointsGiftEnum,
  MerchantGoodsIsPointsDiscountEnum,
  MerchantGoodsPrizeGetMethodsEnum,
  MerchantGoodsTypeEnum,
} from '@typeorm/meeluoShop';
import { IsEnum } from '@core/decorator';

export enum MerchantGoodsOrderTypeEnum {
  DEFAULT = 10,
  SALES = 20,
  UP_PRICE = 30,
  DOWN_PRICE = 40,
  NEW = 50,
}

export class MerchantGoodsListDTO {
  @ApiProperty({
    required: false,
    description: '商品分类id，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '商品分类id必须为数字类型' })
  categoryId?: number;

  @ApiProperty({
    required: false,
    enum: MerchantGoodsIsActiveEnum,
    description: '是否上架，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsIsActiveEnum)
  isActive?: MerchantGoodsIsActiveEnum;

  @ApiProperty({
    required: false,
    enum: MerchantGoodsTypeEnum,
    description: '商品类型，10 商品 20 菜品，默认10',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsTypeEnum)
  type?: MerchantGoodsTypeEnum;

  @ApiProperty({
    required: false,
    enum: MerchantGoodsOrderTypeEnum,
    description:
      '商品排序方式，10综合排序，20销量排序，30价格从高到低，40价格从低到高，50上架时间排序',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsOrderTypeEnum)
  orderType?: MerchantGoodsOrderTypeEnum = MerchantGoodsOrderTypeEnum.DEFAULT;

  @ApiProperty({
    required: false,
    description: '商品名称，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50)
  @Transform(val => val || undefined)
  name?: string;

  @ApiProperty({
    type: Number,
    description: '当前页码',
  })
  @Type(() => Number)
  @IsInt({ message: '当前页码必须为数字类型' })
  @Min(1, { message: '当前页码不能少于1' })
  pageIndex? = 1;

  @ApiProperty({
    type: Number,
    description: '每页数量',
  })
  @Type(() => Number)
  @IsInt({ message: '每页数量必须为数字类型' })
  @Max(500, { message: '每页数量不能超过500条' })
  pageSize = 15;
}

export class MerchantGoodsIdsDTO {
  @ApiProperty({
    required: false,
    type: [Number],
    description: '指定商品id列表',
  })
  @Type(() => Number)
  @IsOptional()
  @ArrayMaxSize(500)
  @IsArray({ message: '商品id列表格式不正确' })
  @IsInt({ each: true, message: '商品id必须为数字类型' })
  ids: number[];
}

export class MerchantGoodsInfoDTO {
  @ApiProperty({
    description: '商品名称',
  })
  @MaxLength(200, { message: '商品名称长度不能超过200' })
  name: string;

  @ApiProperty({
    enum: MerchantGoodsTypeEnum,
    description: '商品类型，10 商品 20 菜品，默认10',
  })
  @Type(() => Number)
  @IsEnum(MerchantGoodsTypeEnum)
  type: MerchantGoodsTypeEnum;

  @ApiProperty({
    required: false,
    description: '商品卖点',
  })
  @IsOptional()
  @MaxLength(300, { message: '商品卖点长度不能超过300' })
  sellingPoint: string;

  @ApiProperty({
    required: false,
    description: '商品单位，针对菜品，例：份',
  })
  @IsOptional()
  @MaxLength(10, { message: '商品单位长度不能超过10' })
  unit: string;

  @ApiProperty({
    required: false,
    type: Number,
    description: '每桌/人限购数量，0为不限制',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '限购数量必须为数字类型' })
  limit = 0;

  @ApiProperty({
    description: '产品缩略图id',
  })
  @Type(() => Number)
  @IsInt({ message: '产品缩略图id必须为数字类型' })
  thumbnailId: number;

  @ApiProperty({
    required: false,
    description: '运费模板id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '运费模板id必须为数字类型' })
  deliveryId?: number;

  @ApiProperty({
    required: false,
    description: '购买后赠送的优惠券id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '优惠券id必须为数字类型' })
  giftCouponId?: number;

  @ApiProperty({
    required: false,
    enum: MerchantGoodsSpecTypeEnum,
    description: '规格类型，10单规格，20多规格，默认10',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsSpecTypeEnum)
  specType: MerchantGoodsSpecTypeEnum = MerchantGoodsSpecTypeEnum.SINGLE;

  @ApiProperty({
    type: String,
    required: false,
    description: '商品内容',
  })
  @IsOptional()
  content = '';

  @ApiProperty({
    required: false,
    type: Number,
    description: '初始销量',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '初始销量必须为数字类型' })
  salesInitial = 0;

  @ApiProperty({
    required: false,
    enum: MerchantGoodsIsPointsDiscountEnum,
    description: '是否允许使用积分抵扣(1允许 0不允许)，默认0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsIsPointsDiscountEnum)
  isPointsDiscount: MerchantGoodsIsPointsDiscountEnum =
    MerchantGoodsIsPointsDiscountEnum.FALSE;

  @ApiProperty({
    required: false,
    type: Number,
    description: '包装费用，针对点餐外卖有效，不收为0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的包装费用' },
  )
  @Max(1e8, { message: '包装费用最多不能超过1亿' })
  @Min(0, { message: '请输入正确的包装费用' })
  packingFee = 0;

  @ApiProperty({
    required: false,
    type: Number,
    description: '最高积分抵扣额度（元）',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的积分抵扣额度' },
  )
  @Max(1e8, { message: '最高积分抵扣额度最多不能超过1亿' })
  @Min(0, { message: '请输入正确的积分抵扣额度' })
  maxPointsDiscountAmount = 0;

  @ApiProperty({
    required: false,
    enum: MerchantGoodsIsPointsGiftEnum,
    description: '是否开启积分赠送(1开启 0关闭)，默认0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsIsPointsGiftEnum)
  isPointsGift: MerchantGoodsIsPointsGiftEnum =
    MerchantGoodsIsPointsGiftEnum.FALSE;

  @ApiProperty({
    required: false,
    enum: MerchantGoodsIsEnableGradeEnum,
    description: '是否开启会员折扣(1开启 0关闭)，默认0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsIsEnableGradeEnum)
  isEnableGrade: MerchantGoodsIsEnableGradeEnum =
    MerchantGoodsIsEnableGradeEnum.FALSE;

  @ApiProperty({
    required: false,
    enum: MerchantGoodsIsActiveEnum,
    description: '是否上架，不传查询所有',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsIsActiveEnum)
  isActive: MerchantGoodsIsActiveEnum = MerchantGoodsIsActiveEnum.TRUE;

  @ApiProperty({
    required: false,
    enum: MerchantGoodsPrizeGetMethodsEnum,
    description: '作为奖品的领取方式，10店内领取，20邮寄配送',
  })
  @Type(() => Number)
  @IsOptional()
  @IsEnum(MerchantGoodsPrizeGetMethodsEnum)
  prizeGetMethods: MerchantGoodsPrizeGetMethodsEnum;

  @ApiProperty({
    description: '商品分类id，不传查询所有',
  })
  @Type(() => Number)
  @IsInt({ message: '商品分类id必须为数字类型' })
  categoryId: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: '商品序号',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '商品序号必须为数字类型' })
  order = 100;
}

export class MerchantGoodsActiveDTO {
  @ApiProperty({
    required: false,
    enum: MerchantGoodsIsActiveEnum,
    description: '是否上架，1是，0否',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantGoodsIsActiveEnum, { message: '错误的上架状态' })
  isActive: MerchantGoodsIsActiveEnum = MerchantGoodsIsActiveEnum.TRUE;
}

export class MerchantGoodsSpecIdsDTO {
  @ApiProperty({
    required: false,
    description: '商品规格类型id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '商品规格类型id必须为数字类型' })
  specId: number;

  @ApiProperty({
    required: false,
    description: '商品规格值id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '商品规格值id必须为数字类型' })
  specValueId: number;
}

export class MerchantGoodsSkuInfoDTO {
  @ApiProperty({
    required: false,
    description: '规格图id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '规格图id必须为数字类型' })
  imageId: number;

  @ApiProperty({
    required: false,
    description: '商品规格编号',
  })
  @IsOptional()
  @MaxLength(100, { message: '商品规格编号长度不能超过100' })
  number: string;

  @ApiProperty({
    description: '销售价格（元）',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的销售价格' },
  )
  @Max(1e8, { message: '销售价格最多不能超过1亿' })
  @Min(0.01, { message: '请输入正确的销售价格' })
  price: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: '商品划线价格（元）',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的商品划线价格' },
  )
  @Max(1e8, { message: '商品划线价格最多不能超过1亿' })
  @Min(0, { message: '请输入正确的商品划线价格' })
  linePrice = 0;

  @ApiProperty({
    description: '库存数量',
  })
  @Type(() => Number)
  @IsInt({ message: '库存数量必须为数字类型' })
  @Max(1e8, { message: '商品库存数量最多不能超过1亿' })
  @Min(1, { message: '请输入正确的商品库存数量' })
  stock: number;

  @ApiProperty({
    description: '商品重量(Kg)',
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '请输入正确的商品重量' },
  )
  @Min(0, { message: '请输入正确的商品重量' })
  weight: number;

  @ApiProperty({
    required: false,
    description: '商品sku记录索引 (由多个规格id拼接组成)，单规格无需填写',
  })
  @Type(() => String)
  @IsOptional()
  @MaxLength(200)
  specSkuId: string;
}

export class ModifyMerchantGoodsDTO {
  @Type(() => MerchantGoodsInfoDTO)
  @ValidateNested()
  goods: MerchantGoodsInfoDTO;

  @ApiProperty({
    type: [Number],
    description: '商品图片id列表',
  })
  @Type(() => Number)
  @ArrayMaxSize(200)
  @ArrayMinSize(1, { message: '商品图片不能为空' })
  @IsArray({ message: '图片id列表格式不正确' })
  @IsInt({ each: true, message: '图片id必须为数字类型' })
  imageIds: number[];

  @Type(() => MerchantGoodsSpecIdsDTO)
  @ValidateNested({ each: true })
  specIds?: MerchantGoodsSpecIdsDTO[];

  @Type(() => MerchantGoodsSkuInfoDTO)
  @ValidateNested({ each: true })
  skus: MerchantGoodsSkuInfoDTO[];
}

export class MerchantGoodsIdDTO {
  @ApiProperty({
    description: '商品id',
  })
  @Type(() => Number)
  @IsInt({ message: '商品id必须为数字类型' })
  id: number;
}
