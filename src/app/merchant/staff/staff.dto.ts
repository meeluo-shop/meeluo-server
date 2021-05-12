import { Type, Transform } from 'class-transformer';
import {
  Min,
  Max,
  IsEmail,
  IsMobilePhone,
  IsOptional,
  MaxLength,
  IsInt,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { IsEnum } from '@core/decorator';
import { ApiProperty } from '@shared/swagger';
import { MerchantStaffIsActiveEnum } from '@typeorm/meeluoShop';

export class MerchantModifyStaffDTO {
  @ApiProperty({
    required: false,
    description: '员工工号',
  })
  @IsOptional()
  @MaxLength(50, { message: '工号长度不能超过50' })
  staffNo: string;

  @ApiProperty({
    description: '密码',
  })
  @MaxLength(100, { message: '密码长度不能超过100' })
  password: string;

  @ApiProperty({
    required: false,
    description: '员工名称',
  })
  @IsOptional()
  @MaxLength(50, { message: '员工名称长度不能超过50' })
  nickname?: string;

  @ApiProperty({
    required: false,
    description: '员工头像',
  })
  @IsOptional()
  @MaxLength(200, { message: '员工头像长度不能超过200' })
  avatar?: string;

  @ApiProperty({
    required: false,
    enum: MerchantStaffIsActiveEnum,
    description: '是否启用',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantStaffIsActiveEnum)
  isActive: MerchantStaffIsActiveEnum = MerchantStaffIsActiveEnum.TRUE;

  @ApiProperty({
    required: false,
    description: '电子邮箱',
  })
  @IsOptional()
  @IsEmail({}, { message: '错误的电子邮箱格式' })
  email?: string;

  @ApiProperty({
    description: '手机号',
  })
  @IsMobilePhone('zh-CN', {}, { message: '错误的手机号码格式' })
  phone?: string;

  @ApiProperty({
    required: false,
    type: [Number],
    description: '角色id列表',
  })
  @IsOptional()
  @Type(() => Number)
  @ArrayMaxSize(200)
  @IsArray({ message: '角色id列表格式不正确' })
  @IsInt({ each: true, message: '角色id必须为数字类型' })
  roleIds?: number[];
}

export class MerchantStaffIdDTO {
  @ApiProperty({
    description: '员工id',
  })
  @Type(() => Number)
  @IsInt({ message: '员工id必须为数字类型' })
  id: number;
}

export class MerchantStaffListDTO {
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

  @ApiProperty({
    required: false,
    description: '员工名称，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50)
  @Transform(val => val || undefined)
  nickname?: string;

  @ApiProperty({
    required: false,
    description: '手机号码，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50)
  @Transform(val => val || undefined)
  phone?: string;

  @ApiProperty({
    required: false,
    description: '电子邮箱，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50)
  @Transform(val => val || undefined)
  email?: string;
}

export class MerchantStaffActiveDTO {
  @ApiProperty({
    required: false,
    enum: MerchantStaffIsActiveEnum,
    description: '是否启用，1启用，0不启用',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantStaffIsActiveEnum, { message: '错误的启用状态' })
  isActive: MerchantStaffIsActiveEnum = MerchantStaffIsActiveEnum.TRUE;
}

export class MerchantStaffIdListDTO {
  @ApiProperty({
    type: [Number],
    description: '员工id列表',
  })
  @Type(() => Number)
  @ArrayMaxSize(200)
  @ArrayMinSize(1, { message: '员工id不能为空' })
  @IsArray({ message: '员工id列表格式不正确' })
  @IsInt({ each: true, message: '员工id必须为数字类型' })
  ids: number[];
}

export class MerchantStaffBindWechatUserDTO {
  @ApiProperty({
    description: '微信用户openid',
  })
  @MaxLength(50, { message: '无效的微信用户openid' })
  openid?: string;
}
