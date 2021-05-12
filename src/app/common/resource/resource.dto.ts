import { ApiProperty } from '@shared/swagger';
import {
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  Max,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import {
  CommonResourceGroupTypeEnum,
  CommonResourceStorageEnum,
  CommonResourceTypeEnum,
} from '@typeorm/meeluoShop';
import { Type } from 'class-transformer';
import { IsEnum } from '@core/decorator';

export class ModifyResourceGroupDTO {
  @ApiProperty({
    description: '分组名称',
  })
  @MaxLength(50, { message: '分组名称长度不能超过50' })
  name: string;

  @ApiProperty({
    required: false,
    enum: CommonResourceGroupTypeEnum,
    description: '分类类型，默认为图片类型',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(CommonResourceGroupTypeEnum)
  type: CommonResourceGroupTypeEnum = CommonResourceGroupTypeEnum.IMAGE;

  @ApiProperty({
    required: false,
    type: Number,
    description: '分组顺序',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '请输入正确的分组顺序' })
  order = 100;
}

export class ResourceGroupIdDTO {
  @ApiProperty({
    description: '分组id',
  })
  @Type(() => Number)
  @IsInt({ message: '分组id必须为数字类型' })
  id: number;
}

export class ResourceGroupListDTO {
  @ApiProperty({
    type: Number,
    description: '当前页码',
  })
  @Type(() => Number)
  @IsInt({ message: '当前页码必须为数字类型' })
  @Min(1, { message: '当前页码不能少于1' })
  pageIndex = 1;

  @ApiProperty({
    type: Number,
    description: '每页数量',
  })
  @Type(() => Number)
  @IsInt({ message: '每页数量必须为数字类型' })
  @Max(200, { message: '每页数量不能超过200条' })
  pageSize = 15;
}

export class ResourceListDTO {
  @ApiProperty({
    required: false,
    description: '分组id',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '分组id必须为数字类型' })
  groupId?: number;

  @ApiProperty({
    type: Number,
    description: '当前页码',
  })
  @Type(() => Number)
  @IsInt({ message: '当前页码必须为数字类型' })
  @Min(1, { message: '当前页码不能少于1' })
  pageIndex = 1;

  @ApiProperty({
    type: Number,
    description: '每页数量',
  })
  @Type(() => Number)
  @IsInt({ message: '每页数量必须为数字类型' })
  @Max(200, { message: '每页数量不能超过200条' })
  pageSize = 15;
}

export class FileInfoDTO {
  @ApiProperty({
    required: false,
    enum: CommonResourceStorageEnum,
    description: '存储对象，0其他，10七牛云，默认10',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(CommonResourceStorageEnum)
  storage: CommonResourceStorageEnum = CommonResourceStorageEnum.QINIU;

  @ApiProperty({
    description: '文件远程地址',
  })
  @MaxLength(500, { message: '文件远程地址长度不能超过500' })
  url: string;

  @ApiProperty({
    description: '文件名称',
  })
  @MaxLength(500, { message: '文件名称长度不能超过500' })
  name: string;

  @ApiProperty({
    description: '文件唯一标识',
  })
  @MaxLength(50, { message: '文件唯一标识长度不能超过50' })
  uuid: string;

  @ApiProperty({
    description: '文件大小',
  })
  @Type(() => Number)
  @IsInt({ message: '文件大小必须为数字类型' })
  size: number;

  @ApiProperty({
    required: false,
    enum: CommonResourceTypeEnum,
    description: '文件类型，0其他，10图片，默认0',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(CommonResourceTypeEnum)
  type: CommonResourceTypeEnum = CommonResourceTypeEnum.OTHER;

  @ApiProperty({
    description: '文件后缀',
  })
  @MaxLength(500, { message: '文件后缀长度不能超过500' })
  extension: string;

  @ApiProperty({
    required: false,
    description: '资源分组id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '资源分组id必须为数字类型' })
  groupId: number;
}

export class UploadFilesDTO {
  @ApiProperty({
    type: [FileInfoDTO],
    description: '文件列表',
  })
  @Type(() => FileInfoDTO)
  @ValidateNested({ each: true })
  files: FileInfoDTO[];
}

export class ResourceIdsDTO {
  @ApiProperty({
    type: [Number],
    description: '资源文件id列表',
  })
  @Type(() => Number)
  @ArrayMaxSize(200, { message: '目标数量最多不能超过200' })
  @ArrayMinSize(1, { message: '文件id不能为空' })
  @IsArray({ message: '文件id列表格式不正确' })
  @IsInt({ each: true, message: '文件id必须为数字类型' })
  ids: number[];
}

export class MoveResourceDTO extends ResourceIdsDTO {
  @ApiProperty({
    description: '资源分组id',
  })
  @Type(() => Number)
  @IsInt({ message: '资源分组id必须为数字类型' })
  groupId: number;
}
