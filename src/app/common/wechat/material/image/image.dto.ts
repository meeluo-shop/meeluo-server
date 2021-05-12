import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength } from 'class-validator';

export class WechatMaterialImageDTO {
  @ApiProperty({
    description: '素材名称',
  })
  @IsString({ message: '错误素材名称' })
  @MaxLength(50, { message: '素材名称长度不能超过50' })
  name: string;

  @ApiProperty({
    description: '图片资源id',
  })
  @Type(() => Number)
  @IsInt({ message: '图片资源id必须为数字类型' })
  resourceId: number;
}
