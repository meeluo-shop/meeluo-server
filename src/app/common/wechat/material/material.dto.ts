import { Type } from 'class-transformer';
import { ApiProperty } from '@shared/swagger';
import { IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export class WechatMaterialNameDTO {
  @ApiProperty({
    description: '素材名称',
  })
  @IsString({ message: '错误素材名称' })
  @MaxLength(50, { message: '素材名称长度不能超过50' })
  name: string;
}

export class WechatMaterialIdDTO {
  @ApiProperty({
    description: '素材id',
  })
  @Type(() => Number)
  @IsInt({ each: true, message: '素材id必须为数字类型' })
  id: number;
}

export class WechatMaterialListDTO {
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
  pageSize = 20;
}
