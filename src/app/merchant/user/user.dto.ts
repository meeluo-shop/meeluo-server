import {
  MaxLength,
  IsInt,
  Max,
  Min,
  IsOptional,
  IsMobilePhone,
} from 'class-validator';
import { ApiProperty } from '@shared/swagger';
import { Type, Transform } from 'class-transformer';
import { MerchantUserIsActiveEnum } from '@typeorm/meeluoShop';
import { IsEnum } from '@core/decorator';

export class MerchantUserListDTO {
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
    description: '微信昵称，模糊匹配',
  })
  @IsOptional()
  @MaxLength(50)
  @Transform(val => val || undefined)
  wechatName?: string;

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
    description: '用户会员等级id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '用户会员等级id必须为数字类型' })
  gradeId: number;
}

export class MerchantUserIdDTO {
  @ApiProperty({
    description: '用户id',
  })
  @Type(() => Number)
  @IsInt({ message: '用户id必须为数字类型' })
  id: number;
}

export class MerchantUserActiveDTO {
  @ApiProperty({
    required: false,
    enum: MerchantUserIsActiveEnum,
    description: '是否启用，1启用，0不启用',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(MerchantUserIsActiveEnum, { message: '错误的启用状态' })
  isActive: MerchantUserIsActiveEnum = MerchantUserIsActiveEnum.TRUE;
}

export class MerchantModifyUserDTO extends MerchantUserActiveDTO {
  @ApiProperty({
    description: '用户会员等级id',
  })
  @Type(() => Number)
  @IsInt({ message: '用户会员等级id必须为数字类型' })
  gradeId: number;

  @ApiProperty({
    required: false,
    description: '手机号',
  })
  @IsOptional()
  @IsMobilePhone('zh-CN', {}, { message: '错误的手机号码格式' })
  phone?: string;
}
