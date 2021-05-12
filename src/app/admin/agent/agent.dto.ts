import { ApiProperty } from '@shared/swagger';
import {
  MaxLength,
  IsOptional,
  Min,
  Max,
  IsEmail,
  IsMobilePhone,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  AgentIsActiveEnum,
  AgentEntity,
  AgentUserEntity,
} from '@typeorm/meeluoShop';
import { IsEnum } from '@core/decorator';

export class AdminAgentUserDTO {
  @ApiProperty({
    description: '电子邮箱',
  })
  @IsEmail({}, { message: '错误的电子邮箱格式' })
  email: string;

  @ApiProperty({
    description: '手机号',
  })
  @IsMobilePhone('zh-CN', {}, { message: '错误的手机号码格式' })
  phone: string;

  @ApiProperty({
    description: '密码',
  })
  @MaxLength(100, { message: '密码长度不能超过100' })
  password: string;

  @ApiProperty({
    required: false,
    description: '用户昵称',
  })
  @IsOptional()
  @MaxLength(50, { message: '用户昵称长度不能超过50' })
  nickname?: string;
}

export class AdminModifyAgentDTO {
  @ApiProperty({
    description: '代理商名称',
  })
  @MaxLength(50, { message: '代理商名称长度不能超过50' })
  name: string;

  @ApiProperty({
    required: false,
    description: '代理商描述',
  })
  @IsOptional()
  @MaxLength(500, { message: '代理商描述长度不能超过500' })
  remark?: string;

  @ApiProperty({
    description: '联系人',
  })
  @MaxLength(50, { message: '联系人长度不能超过50' })
  liaison: string;

  @ApiProperty({
    description: '联系人电话',
  })
  @MaxLength(50, { message: '联系人电话长度不能超过50' })
  phone: string;

  @ApiProperty({
    required: false,
    description: '公司主体名称',
  })
  @IsOptional()
  @MaxLength(100, { message: '公司主体名称长度不能超过100' })
  companyName?: string;

  @ApiProperty({
    required: false,
    description: '法人姓名',
  })
  @IsOptional()
  @MaxLength(50, { message: '法人姓名长度不能超过50' })
  legalPersonName?: string;

  @ApiProperty({
    required: false,
    description: '法人身份证号',
  })
  @IsOptional()
  @MaxLength(50, { message: '法人身份证号长度不能超过50' })
  legalPersonIdCard?: string;

  @ApiProperty({
    required: false,
    description: '法人身份证照片',
  })
  @IsOptional()
  @MaxLength(200, { message: '法人身份证照片长度不能超过200' })
  legalPersonIdCardPhoto?: string;

  @ApiProperty({
    required: false,
    description: '营业执照照片',
  })
  @IsOptional()
  @MaxLength(200, { message: '营业执照照片长度不能超过200' })
  businessLicensePhoto?: string;

  @ApiProperty({
    required: false,
    type: Number,
    description: '过期时间（时间戳），不传为永不过期',
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(val => val && new Date(val), { toClassOnly: true })
  expireTime?: Date;

  @ApiProperty({
    description: '最多可开通的商户数量，0为不限制，默认为0',
  })
  @Type(() => Number)
  @Min(0, { message: '无效的可开通商户数量' })
  maxMerchantCount: number;

  @ApiProperty({
    required: false,
    enum: AgentIsActiveEnum,
    description: '是否启用',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AgentIsActiveEnum, { message: '是否启用' })
  isActive: AgentIsActiveEnum = AgentIsActiveEnum.TRUE;

  @ApiProperty({
    required: false,
    description: '所在地址',
  })
  @IsOptional()
  @MaxLength(500, { message: '所在地址长度不能超过500' })
  address?: string;

  @Type(() => AdminAgentUserDTO)
  @ValidateNested()
  adminUser: AdminAgentUserDTO;
}

export class AdminAgentIdDTO {
  @ApiProperty({
    description: '代理商id',
  })
  @Type(() => Number)
  @IsInt({ message: '代理商id必须为数字类型' })
  id: number;
}

export class AdminAgentActiveDTO {
  @ApiProperty({
    required: false,
    enum: AgentIsActiveEnum,
    description: '是否启用，1启用，0不启用',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AgentIsActiveEnum, { message: '错误的启用状态' })
  isActive: AgentIsActiveEnum = AgentIsActiveEnum.TRUE;
}

export class AdminAgentListDTO {
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
    description: '代理商名称，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50)
  @Transform(val => val || undefined)
  name?: string;
}

export class AdminAgentDetailResp {
  agent: AgentEntity;
  admin: AgentUserEntity;
}
