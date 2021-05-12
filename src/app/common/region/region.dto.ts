import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumberString } from 'class-validator';
import { IsEnum } from '@core/decorator';

export enum RegionIsAllEnum {
  TRUE = 1,
  FALSE = 0,
}

export class RegionParamDTO {
  @ApiProperty({
    required: false,
    default: RegionIsAllEnum.FALSE,
    enum: RegionIsAllEnum,
    description: '是否获取全部子区域',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(RegionIsAllEnum)
  isAll: RegionIsAllEnum = RegionIsAllEnum.FALSE;
}

export class RegionNumberDTO {
  @ApiProperty({
    description: '地区行政编码',
  })
  @IsNumberString({}, { message: '错误的行政编码' })
  code: string;
}

export class RegionListRespDTO {
  value: string;
  label: string;
  children?: RegionListRespDTO[];
}
