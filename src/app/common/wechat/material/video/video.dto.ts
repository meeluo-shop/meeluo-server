import { ApiProperty } from '@shared/swagger';
import { IsString, MaxLength } from 'class-validator';

export class WechatMaterialVideoDTO {
  @ApiProperty({
    description: '素材名称',
  })
  @IsString({ message: '错误素材名称' })
  @MaxLength(50, { message: '素材名称长度不能超过50' })
  name: string;

  @ApiProperty({
    description: '视频素材描述',
  })
  @IsString({ message: '视频素材描述' })
  @MaxLength(100, { message: '素材描述长度不能超过100' })
  introduction: string;
}
