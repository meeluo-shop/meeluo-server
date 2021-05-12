import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, MaxLength, Min } from 'class-validator';

export class AdminExpressModifyDTO {
  @ApiProperty({
    description: '物流公司名称',
  })
  @MaxLength(50, { message: '物流公司名称长度不能超过50' })
  name: string;

  @ApiProperty({
    description: '物流公司代码',
  })
  @MaxLength(100, { message: '物流公司代码长度不能超过100' })
  code: string;

  @ApiProperty({
    required: false,
    type: Number,
    description: '排序序号，默认100',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '排序序号必须为数字类型' })
  order = 100;
}

export class AdminExpressListDTO {
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
  pageSize? = 500;
}

export class AdminExpressIdDTO {
  @ApiProperty({
    description: '物流公司id',
  })
  @Type(() => Number)
  @IsInt({ message: '物流公司id必须为数字类型' })
  id: number;
}
