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
import { AdminUserGenderEnum, AdminIsActiveEnum } from '@typeorm/meeluoShop';

export class AdminModifyUserDTO {
  @ApiProperty({
    description: '用户名',
  })
  @MaxLength(50, { message: '用户名长度不能超过50' })
  username: string;

  @ApiProperty({
    description: '密码',
  })
  @MaxLength(100, { message: '密码长度不能超过100' })
  password: string;

  @ApiProperty({
    description: '真实姓名',
  })
  @MaxLength(20, { message: '真实姓名长度不能超过20' })
  realname: string;

  @ApiProperty({
    required: false,
    description: '用户昵称',
  })
  @IsOptional()
  @MaxLength(50, { message: '用户昵称长度不能超过50' })
  nickname?: string;

  @ApiProperty({
    required: false,
    description: '用户头像',
  })
  @IsOptional()
  @MaxLength(200, { message: '用户头像长度不能超过200' })
  avatar?: string;

  @ApiProperty({
    required: false,
    enum: AdminUserGenderEnum,
    description: '用户性别',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AdminUserGenderEnum, { message: '错误的性别' })
  gender: AdminUserGenderEnum = AdminUserGenderEnum.UNKNOWN;

  @ApiProperty({
    required: false,
    enum: AdminIsActiveEnum,
    description: '是否启用',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AdminIsActiveEnum)
  isActive: AdminIsActiveEnum = AdminIsActiveEnum.TRUE;

  @ApiProperty({
    required: false,
    description: '电子邮箱',
  })
  @IsOptional()
  @IsEmail({}, { message: '错误的电子邮箱格式' })
  email?: string;

  @ApiProperty({
    required: false,
    description: '手机号',
  })
  @IsOptional()
  @IsMobilePhone('zh-CN', {}, { message: '错误的手机号码格式' })
  mobile?: string;

  @ApiProperty({
    type: [Number],
    description: '角色id列表',
  })
  @Type(() => Number)
  @ArrayMaxSize(200)
  @ArrayMinSize(1, { message: '用户角色不能为空' })
  @IsArray({ message: '角色id列表格式不正确' })
  @IsInt({ each: true, message: '角色id必须为数字类型' })
  roleIds: number[];
}

export class AdminUserIdDTO {
  @ApiProperty({
    description: '用户id',
  })
  @Type(() => Number)
  @IsInt({ message: '用户id必须为数字类型' })
  id: number;
}

export class AdminUserListDTO {
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
    description: '用户名称，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50)
  @Transform(val => val || undefined)
  username?: string;

  @ApiProperty({
    required: false,
    description: '手机号码，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50)
  @Transform(val => val || undefined)
  mobile?: string;

  @ApiProperty({
    required: false,
    description: '电子邮箱，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50)
  @Transform(val => val || undefined)
  email?: string;
}

export class AdminUserActiveDTO {
  @ApiProperty({
    required: false,
    enum: AdminIsActiveEnum,
    description: '是否启用，1启用，0不启用',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AdminIsActiveEnum, { message: '错误的启用状态' })
  isActive: AdminIsActiveEnum = AdminIsActiveEnum.TRUE;
}

export class AdminUserIdListDTO {
  @ApiProperty({
    type: [Number],
    description: '用户id列表',
  })
  @Type(() => Number)
  @ArrayMaxSize(200)
  @ArrayMinSize(1, { message: '用户id不能为空' })
  @IsArray({ message: '用户id列表格式不正确' })
  @IsInt({ each: true, message: '用户id必须为数字类型' })
  ids: number[];
}
