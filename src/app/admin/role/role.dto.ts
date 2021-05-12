import { Type, Transform } from 'class-transformer';
import {
  Min,
  Max,
  IsOptional,
  MaxLength,
  IsInt,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@shared/swagger';
import { IsEnum } from '@core/decorator';
import { AdminMenuEntity, AdminPermEntity } from '@typeorm/meeluoShop';

export enum AdminHasPermissionsEnum {
  TRUE = 1,
  FALSE = 0,
}

export enum AdminHasMenusEnum {
  TRUE = 1,
  FALSE = 0,
}

export class AdminModifyRoleDTO {
  @ApiProperty({
    description: '角色名称',
  })
  @MaxLength(200, { message: '角色名称长度不能超过200' })
  name: string;

  @ApiProperty({
    description: '角色编号',
  })
  @MaxLength(200, { message: '角色编号长度不能超过200' })
  code: string;

  @ApiProperty({
    required: false,
    description: '角色备注',
  })
  @IsOptional()
  @MaxLength(250, { message: '角色备注长度不能超过250' })
  remark?: string;
}

export class AdminRoleDetailDTO {
  @ApiProperty({
    required: false,
    enum: AdminHasPermissionsEnum,
    description: '是否查询角色下的权限',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AdminHasPermissionsEnum)
  hasPermissions: AdminHasPermissionsEnum = AdminHasPermissionsEnum.FALSE;

  @ApiProperty({
    required: false,
    enum: AdminHasMenusEnum,
    description: '是否查询角色下的导航',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AdminHasMenusEnum)
  hasMenus: AdminHasMenusEnum = AdminHasMenusEnum.FALSE;
}

export class AdminRoleIdDTO {
  @ApiProperty({
    description: '角色id',
  })
  @Type(() => Number)
  @IsInt({ message: '角色id必须为数字类型' })
  id: number;
}

export class AdminRoleIdListDTO {
  @ApiProperty({
    type: [Number],
    description: '角色id列表',
  })
  @Type(() => Number)
  @ArrayMaxSize(500)
  @ArrayMinSize(1, { message: '角色id不能为空' })
  @IsArray({ message: '角色id列表格式不正确' })
  @IsInt({ each: true, message: '角色id必须为数字类型' })
  ids: number[];
}

export class AdminRoleListDTO {
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
  @Max(500, { message: '每页数量不能超过500条' })
  pageSize = 15;

  @ApiProperty({
    required: false,
    description: '角色名称，模糊匹配',
  })
  @IsOptional()
  @MaxLength(200)
  @Transform(val => val || undefined)
  name?: string;

  @ApiProperty({
    required: false,
    description: '角色编号，模糊匹配',
  })
  @IsOptional()
  @MaxLength(200)
  @Transform(val => val || undefined)
  code?: string;
}

export class RolePowersDTO {
  menus: AdminMenuEntity[];
  permissions: AdminPermEntity[];
}
